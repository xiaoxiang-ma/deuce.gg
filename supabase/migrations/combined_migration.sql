-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS completed_matches;
DROP TABLE IF EXISTS match_requests;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS session_status;
DROP TYPE IF EXISTS session_intent;

-- Create enum types
CREATE TYPE session_status AS ENUM ('open', 'full', 'completed', 'cancelled');
CREATE TYPE session_intent AS ENUM ('match', 'rally', 'drills');

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT NOT NULL,
  skill_level NUMERIC(3,1) NOT NULL CHECK (skill_level >= 2.5 AND skill_level <= 4.5),
  elo_rating INTEGER NOT NULL DEFAULT 1200,
  location_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 90, -- in minutes
  intent session_intent NOT NULL,
  skill_min NUMERIC(3,1) NOT NULL CHECK (skill_min >= 2.5 AND skill_min <= 4.5),
  skill_max NUMERIC(3,1) NOT NULL CHECK (skill_max >= 2.5 AND skill_max <= 4.5),
  max_players INTEGER NOT NULL DEFAULT 2,
  current_players INTEGER NOT NULL DEFAULT 1,
  status session_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT valid_skill_range CHECK (skill_min <= skill_max),
  CONSTRAINT valid_max_players CHECK (max_players >= 2),
  CONSTRAINT valid_current_players CHECK (current_players <= max_players),
  CONSTRAINT future_date_time CHECK (date_time > created_at)
);

-- Create match_requests table
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  requester_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Add constraints
  CONSTRAINT unique_session_request UNIQUE (session_id, requester_id)
);

-- Create completed_matches table
CREATE TABLE completed_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player1_id TEXT NOT NULL,
  player2_id TEXT NOT NULL,
  winner_id TEXT,
  player1_elo_before INTEGER NOT NULL,
  player2_elo_before INTEGER NOT NULL,
  player1_elo_after INTEGER NOT NULL,
  player2_elo_after INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for common queries
CREATE INDEX idx_sessions_date_time ON sessions(date_time);
CREATE INDEX idx_sessions_skill_range ON sessions(skill_min, skill_max);
CREATE INDEX idx_match_requests_session ON match_requests(session_id);
CREATE INDEX idx_completed_matches_players ON completed_matches(player1_id, player2_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at
  BEFORE UPDATE ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update session status when match request is accepted
CREATE OR REPLACE FUNCTION update_session_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' THEN
        UPDATE sessions 
        SET 
            current_players = current_players + 1,
            status = CASE 
                WHEN current_players + 1 >= max_players THEN 'full'::session_status
                ELSE status
            END,
            updated_at = NOW()
        WHERE id = NEW.session_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match request status changes
CREATE TRIGGER on_match_request_update
    AFTER UPDATE ON match_requests
    FOR EACH ROW
    WHEN (OLD.status != NEW.status)
    EXECUTE FUNCTION update_session_status();

-- Create RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_matches ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Anyone can view open sessions" ON sessions
    FOR SELECT USING (status = 'open');

CREATE POLICY "Users can create sessions" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Creators can update their sessions" ON sessions
    FOR UPDATE USING (true);

-- Match requests policies
CREATE POLICY "Users can view their match requests" ON match_requests
    FOR SELECT USING (true);

CREATE POLICY "Users can create match requests" ON match_requests
    FOR INSERT WITH CHECK (
        requester_id NOT IN (
            SELECT creator_id FROM sessions WHERE id = session_id
        )
    );

CREATE POLICY "Session creators can update match requests" ON match_requests
    FOR UPDATE USING (true);

-- Users policies
CREATE POLICY "Users can view other users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (true);

-- Completed matches policies
CREATE POLICY "Anyone can view completed matches" ON completed_matches
    FOR SELECT USING (true); 