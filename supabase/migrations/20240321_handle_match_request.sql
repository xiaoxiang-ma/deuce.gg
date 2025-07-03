-- Function to handle match request acceptance
CREATE OR REPLACE FUNCTION handle_match_request(
  p_request_id UUID,
  p_session_id UUID,
  p_action TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_status session_status;
  v_current_players INTEGER;
  v_max_players INTEGER;
BEGIN
  -- Verify the session exists and get its status
  SELECT status, current_players, max_players
  INTO v_session_status, v_current_players, v_max_players
  FROM sessions
  WHERE id = p_session_id
  FOR UPDATE; -- Lock the row for update

  -- Check if session is open
  IF v_session_status != 'open' THEN
    RAISE EXCEPTION 'Cannot accept request: session is not open';
  END IF;

  -- Check if session has room
  IF v_current_players >= v_max_players THEN
    RAISE EXCEPTION 'Cannot accept request: session is full';
  END IF;

  -- Update the match request status
  UPDATE match_requests
  SET 
    status = p_action,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- If accepting the request, update session
  IF p_action = 'accepted' THEN
    UPDATE sessions
    SET
      current_players = current_players + 1,
      status = CASE 
        WHEN current_players + 1 >= max_players THEN 'full'::session_status
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = p_session_id;
  END IF;
END;
$$; 