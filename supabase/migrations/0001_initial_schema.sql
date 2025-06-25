-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT NOT NULL,
  skill_level NUMERIC(3,1) NOT NULL CHECK (skill_level >= 2.5 AND skill_level <= 4.5),
  elo_rating INTEGER NOT NULL,
  location_preference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  intent TEXT NOT NULL CHECK (intent IN ('match', 'rally', 'drills')),
  skill_min NUMERIC(3,1) NOT NULL CHECK (skill_min >= 2.5 AND skill_min <= 4.5),
  skill_max NUMERIC(3,1) NOT NULL CHECK (skill_max >= 2.5 AND skill_max <= 4.5),
  max_players INTEGER NOT NULL DEFAULT 2,
  current_players INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create match_requests table
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  requester_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create completed_matches table
CREATE TABLE completed_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  player1_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  player2_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  winner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
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

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 