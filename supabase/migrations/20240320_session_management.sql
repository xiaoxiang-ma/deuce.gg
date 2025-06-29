-- Create enum types for session status and intent
CREATE TYPE session_status AS ENUM ('open', 'full', 'completed', 'cancelled');
CREATE TYPE session_intent AS ENUM ('match', 'rally', 'drills');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 90, -- in minutes
    intent session_intent NOT NULL,
    skill_min NUMERIC(3,1) NOT NULL,
    skill_max NUMERIC(3,1) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 2,
    current_players INTEGER NOT NULL DEFAULT 1,
    status session_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Add constraints
    CONSTRAINT valid_skill_range CHECK (skill_min <= skill_max),
    CONSTRAINT valid_skill_values CHECK (skill_min >= 2.5 AND skill_max <= 4.5),
    CONSTRAINT valid_max_players CHECK (max_players >= 2),
    CONSTRAINT valid_current_players CHECK (current_players <= max_players),
    CONSTRAINT future_date_time CHECK (date_time > created_at)
);

-- Create match requests table
CREATE TABLE IF NOT EXISTS match_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id),
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Add constraints
    CONSTRAINT unique_session_request UNIQUE (session_id, requester_id)
);

-- Create RLS policies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Anyone can view open sessions" ON sessions
    FOR SELECT USING (status = 'open');

CREATE POLICY "Users can create sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their sessions" ON sessions
    FOR UPDATE USING (auth.uid() = creator_id);

-- Match requests policies
CREATE POLICY "Users can view their match requests" ON match_requests
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() IN (
            SELECT creator_id FROM sessions WHERE id = session_id
        )
    );

CREATE POLICY "Users can create match requests" ON match_requests
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id AND
        auth.uid() NOT IN (
            SELECT creator_id FROM sessions WHERE id = session_id
        )
    );

CREATE POLICY "Session creators can update match requests" ON match_requests
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT creator_id FROM sessions WHERE id = session_id
        )
    );

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