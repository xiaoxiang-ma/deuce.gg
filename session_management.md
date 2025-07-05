# Session Management Architecture - Component & Flow Reference

## System Architecture Overview

### Core Components Hierarchy
```
SessionDetailPage (Main Container)
├── SessionInfo (Display Component)
├── CreatorProfile (Display Component)
├── SessionActions (State-dependent Action Hub)
│   ├── RequestButton (When status = 'open')
│   ├── RequestList (Creator view, when requests exist)
│   ├── ConfirmationStatus (When status = 'confirmed')
│   └── CompletionForm (When past session time)
├── ParticipantsList (Display Component)
└── RealTimeSubscriptions (Data Layer)
```

### State Management Flow
```
UI Component → Action Handler → API Call → Database Update → Real-time Subscription → UI Update
```

## Detailed Action Flows

### 1. SESSION REQUEST FLOW

#### UI Level (User B requests to join User A's session)
**Component**: `RequestButton.tsx`
- **Trigger**: User B clicks "Request to Join"
- **UI State**: Button shows loading spinner
- **Modal Opens**: Message input field (optional)
- **Validation**: Check if user eligible, no existing request
- **Action**: `handleRequestSubmit(message: string)`

#### Backend Level
**API Endpoint**: `POST /api/sessions/[id]/request`
- **Authentication**: Verify user B is authenticated
- **Authorization**: Check user B can request (skill range, not creator, no existing request)
- **Database Operations**:
  1. Insert into `match_requests` table
  2. Update `sessions.status` from 'open' to 'requested'
  3. Insert notification for User A into `notifications` table
- **Real-time Trigger**: Broadcast session update to all subscribers

#### Database Level
**Tables Affected**:
```sql
-- New record
INSERT INTO match_requests (session_id, requester_id, status, message)
-- Session status update
UPDATE sessions SET status = 'requested' WHERE id = session_id
-- Notification creation
INSERT INTO notifications (user_id, type, title, message, data)
```

#### Real-time Propagation
**Subscription Channels**:
- `session-{sessionId}`: Updates session status for all viewers
- `notifications-{userA}`: Alerts User A of new request
- `requests-{sessionId}`: Updates request list for creator

---

### 2. REQUEST ACCEPTANCE FLOW

#### UI Level (User A accepts User B's request)
**Component**: `RequestList.tsx` → `RequestCard.tsx`
- **Trigger**: User A clicks "Accept" button
- **UI State**: Button shows loading, disable other actions
- **Optimistic Update**: Show accepted state immediately
- **Action**: `handleRequestAction(requestId, 'accept')`

#### Backend Level
**API Endpoint**: `PATCH /api/sessions/[id]/request/[requestId]`
- **Authentication**: Verify User A is authenticated
- **Authorization**: Check User A is session creator
- **Database Operations**:
  1. Update `match_requests.status` to 'accepted'
  2. Update `sessions` with joiner info and status change to 'confirmed'
  3. Set `sessions.expires_at` to 24 hours from now
  4. Insert notification for User B
- **Real-time Trigger**: Broadcast to both users

#### Database Level
**Tables Affected**:
```sql
-- Update request status
UPDATE match_requests SET status = 'accepted', responded_at = NOW() WHERE id = request_id
-- Update session with joiner and new status
UPDATE sessions SET 
  status = 'confirmed',
  joiner_id = requester_id,
  current_players = 2,
  expires_at = NOW() + INTERVAL '24 hours'
WHERE id = session_id
-- Create notification
INSERT INTO notifications (user_id, type, title, message, data)
```

#### Real-time Propagation
**Subscription Channels**:
- `session-{sessionId}`: Updates session status and participant info
- `notifications-{userB}`: Alerts User B of acceptance
- `dashboard-{userA}`: Updates creator's session list
- `dashboard-{userB}`: Updates joiner's session list

---

### 3. MUTUAL CONFIRMATION FLOW

#### UI Level (Both users confirm attendance)
**Component**: `ConfirmationStatus.tsx`
- **Trigger**: User clicks "Confirm Attendance"
- **UI State**: Show confirmation status for both users
- **Visual Feedback**: Checkmarks, waiting states
- **Action**: `handleConfirmAttendance()`

#### Backend Level
**API Endpoint**: `POST /api/sessions/[id]/confirm`
- **Authentication**: Verify user is authenticated
- **Authorization**: Check user is session participant (creator or joiner)
- **Database Operations**:
  1. Update appropriate confirmation field (`creator_confirmed` or `joiner_confirmed`)
  2. Check if both users confirmed
  3. If both confirmed: update status to 'locked' and send final notifications
- **Real-time Trigger**: Update confirmation status

#### Database Level
**Tables Affected**:
```sql
-- Update confirmation status
UPDATE sessions SET 
  creator_confirmed = true  -- OR joiner_confirmed = true
WHERE id = session_id
-- If both confirmed
UPDATE sessions SET status = 'locked' WHERE id = session_id AND creator_confirmed = true AND joiner_confirmed = true
```

#### Real-time Propagation
**Subscription Channels**:
- `session-{sessionId}`: Updates confirmation status for both users
- `notifications-{userId}`: Sends final confirmation notification

---

### 4. SESSION COMPLETION FLOW

#### UI Level (Post-session reporting)
**Component**: `CompletionForm.tsx`
- **Trigger**: Session time has passed, users see completion form
- **UI State**: Multi-step form (Did attend? → What type? → Who won?)
- **Validation**: Ensure required fields completed
- **Action**: `handleCompletionSubmit(completionData)`

#### Backend Level
**API Endpoint**: `POST /api/sessions/[id]/complete`
- **Authentication**: Verify user is authenticated
- **Authorization**: Check user is session participant
- **Database Operations**:
  1. Insert completion record for this user
  2. Check if both users submitted
  3. If both submitted: process results and update ELO ratings
  4. Create completed match record
- **ELO Calculation**: Calculate rating changes based on results

#### Database Level
**Tables Affected**:
```sql
-- Insert completion record
INSERT INTO session_completions (session_id, user_id, did_attend, match_played, reported_winner)
-- If both completed and results match
INSERT INTO completed_matches (session_id, player1_id, player2_id, winner_id, elo_changes...)
-- Update user ELO ratings
UPDATE users SET elo_rating = new_rating WHERE id IN (player1_id, player2_id)
-- Update session status
UPDATE sessions SET status = 'completed' WHERE id = session_id
```

#### Real-time Propagation
**Subscription Channels**:
- `session-{sessionId}`: Updates session completion status
- `profile-{userId}`: Updates user stats and ELO rating
- `matches-{userId}`: Adds new match to history

---

## Component Interaction Architecture

### Session Detail Page Data Flow
```
SessionDetailPage
├── useSession(sessionId) → Fetches session data + real-time updates
├── useMatchRequests(sessionId) → Fetches requests + real-time updates
├── useSessionParticipants(sessionId) → Fetches user profiles
└── useNotifications(userId) → Real-time notification updates
```

### State Dependencies
```
Session Status → Component Visibility
├── 'open' → RequestButton visible (for non-creators)
├── 'requested' → RequestList visible (for creators)
├── 'confirmed' → ConfirmationStatus visible
├── 'locked' → Session details + countdown
└── 'completed' → Match history display
```

### Real-time Subscription Architecture
```
useEffect(() => {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sessions',
      filter: `id=eq.${sessionId}`
    }, (payload) => {
      // Update session state
      setSession(payload.new);
      // Trigger component re-renders based on status
    })
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'match_requests',
      filter: `session_id=eq.${sessionId}`
    }, (payload) => {
      // Update requests list
      updateRequests(payload);
    });
    
  return () => supabase.removeChannel(channel);
}, [sessionId]);
```

## API Endpoint Architecture

### Request Flow Endpoints
```
POST /api/sessions/[id]/request
├── Body: { message?: string }
├── Response: { success: boolean, request: MatchRequest }
└── Side Effects: Creates request, updates session, sends notification

PATCH /api/sessions/[id]/request/[requestId]
├── Body: { action: 'accept' | 'decline' }
├── Response: { success: boolean, request: MatchRequest }
└── Side Effects: Updates request, session status, sends notification

POST /api/sessions/[id]/confirm
├── Body: {} (empty)
├── Response: { success: boolean, session: Session }
└── Side Effects: Updates confirmation, checks both confirmed

POST /api/sessions/[id]/complete
├── Body: { did_attend: boolean, match_played?: boolean, reported_winner?: string }
├── Response: { success: boolean, completion: SessionCompletion }
└── Side Effects: Records completion, processes ELO if both submitted
```

### Error Handling Architecture
```
API Level Errors → HTTP Status Codes
├── 400: Bad Request (validation errors)
├── 401: Unauthorized (not authenticated)
├── 403: Forbidden (not authorized for action)
├── 404: Not Found (session/request not found)
└── 500: Internal Server Error (database/system errors)

UI Level Error Handling
├── try/catch blocks around API calls
├── Toast notifications for user feedback
├── Loading states during async operations
└── Optimistic updates with rollback on failure
```

## Database Schema Requirements

### Key Tables
```sql
-- Sessions: Core session data + confirmation tracking
sessions (
  id, creator_id, joiner_id, title, location, date_time, duration,
  intent, skill_min, skill_max, max_players, current_players,
  status, creator_confirmed, joiner_confirmed, expires_at
)

-- Match Requests: Request tracking
match_requests (
  id, session_id, requester_id, status, message, 
  created_at, responded_at
)

-- Session Completions: Post-session reporting
session_completions (
  id, session_id, user_id, did_attend, match_played, 
  reported_winner, submitted_at
)

-- Completed Matches: Final match records with ELO
completed_matches (
  id, session_id, player1_id, player2_id, winner_id,
  player1_elo_before, player2_elo_before,
  player1_elo_after, player2_elo_after, completed_at
)

-- Notifications: Real-time alerts
notifications (
  id, user_id, type, title, message, data, read, created_at
)
```

### Status Transitions
```sql
-- Session Status Flow
'open' → 'requested' → 'confirmed' → 'locked' → 'completed'/'expired'

-- Request Status Flow
'pending' → 'accepted'/'declined' → 'confirmed' → 'completed'
```

## Implementation Priority

### Phase 1: Core Request Flow
1. SessionDetailPage layout with dynamic components
2. RequestButton component with modal
3. POST /api/sessions/[id]/request endpoint
4. Basic real-time subscription setup

### Phase 2: Request Management
1. RequestList component for creators
2. PATCH /api/sessions/[id]/request/[requestId] endpoint
3. Notification system integration
4. Request status real-time updates

### Phase 3: Confirmation System
1. ConfirmationStatus component
2. POST /api/sessions/[id]/confirm endpoint
3. Mutual confirmation logic
4. Session expiration handling

### Phase 4: Completion & ELO
1. CompletionForm component
2. POST /api/sessions/[id]/complete endpoint
3. ELO calculation utility
4. Match history integration

This architecture provides the complete framework for implementing the session management system with clear component boundaries, data flow, and real-time synchronization.