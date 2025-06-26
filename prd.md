# RallyPoint MVP - Architectural Pseudocode

## System Overview
```
WEB APP: Tennis Session Matchmaking Platform
GOAL: Connect tennis players for skill-matched sessions
TECH STACK: Next.js + Supabase + Clerk + Vercel
```

## Core Data Models

### User Model
```
User {
  id: unique_identifier
  email: string
  name: string
  skill_level: number (2.5-4.5 NTRP scale)
  elo_rating: number (starts at skill_level * 400)
  location_preference: string
  created_at: timestamp
  updated_at: timestamp
}
```

### Session Model
```
Session {
  id: unique_identifier
  creator_id: User.id
  title: string
  location: string
  date_time: datetime
  duration: number (minutes)
  intent: enum [match, rally, drills]
  skill_min: number
  skill_max: number
  max_players: number (default: 2)
  current_players: number
  status: enum [open, full, completed, cancelled]
  created_at: timestamp
}
```

### Match Request Model
```
MatchRequest {
  id: unique_identifier
  session_id: Session.id
  requester_id: User.id
  status: enum [pending, accepted, declined]
  message: string (optional)
  created_at: timestamp
}
```

### Completed Match Model
```
CompletedMatch {
  id: unique_identifier
  session_id: Session.id
  player1_id: User.id
  player2_id: User.id
  winner_id: User.id (or null for tie/practice)
  player1_elo_before: number
  player2_elo_before: number
  player1_elo_after: number
  player2_elo_after: number
  completed_at: timestamp
}
```

## Core System Flows

### 1. User Onboarding Flow
```
START → User visits app
  ↓
IF not authenticated:
  → Clerk auth (sign up/sign in)
  → Collect: name, skill_level, location_preference
  → Calculate initial_elo = skill_level * 400
  → Create User record
  ↓
REDIRECT to Dashboard
END
```

### 2. Create Session Flow
```
START → User clicks "Create Session"
  ↓
FORM: {
  title: "Looking for a match"
  location: user input
  date_time: datetime picker
  intent: dropdown [match, rally, drills]
  skill_range: [user.elo ± 200 points] (adjustable)
  duration: default 90 minutes
}
  ↓
VALIDATE: date_time > now, skill_range valid
  ↓
CREATE Session record with status="open"
  ↓
REDIRECT to Session detail page
END
```

### 3. Browse & Join Sessions Flow
```
START → User clicks "Find Sessions"
  ↓
DISPLAY: Sessions filtered by {
  date: today + next 7 days
  skill_match: user.elo ± 300 points
  status: "open"
  location: within user preference
}
  ↓
FILTERS: {
  date_range: adjustable
  skill_range: adjustable  
  location: searchable
  intent: selectable
}
  ↓
User clicks "Join Session"
  ↓
CREATE MatchRequest with status="pending"
  ↓
NOTIFY session creator
  ↓
IF creator accepts:
  → UPDATE MatchRequest status="accepted"
  → UPDATE Session current_players++
  → IF Session.current_players >= max_players:
    → UPDATE Session status="full"
  → NOTIFY both players
END
```

### 4. ELO Rating System Flow
```
START → Match completed
  ↓
COLLECT: winner_id (or null)
  ↓
GET: player1_elo, player2_elo
  ↓
CALCULATE expected_scores:
  expected1 = 1 / (1 + 10^((elo2-elo1)/400))
  expected2 = 1 - expected1
  ↓
CALCULATE actual_scores:
  IF winner = player1: actual1=1, actual2=0
  IF winner = player2: actual1=0, actual2=1  
  IF tie/practice: actual1=0.5, actual2=0.5
  ↓
CALCULATE new_elos:
  K = 32 (rating adjustment factor)
  new_elo1 = elo1 + K * (actual1 - expected1)
  new_elo2 = elo2 + K * (actual2 - expected2)
  ↓
UPDATE User.elo_rating for both players
  ↓
CREATE CompletedMatch record
END
```

## Application Structure

### Page Hierarchy
```
/ (Landing page - public)
├── /auth (Clerk auth pages)
├── /onboarding (skill level setup)
├── /dashboard (main hub - protected)
├── /sessions
│   ├── /create (create new session)
│   ├── /browse (find sessions)
│   └── /[id] (session details)
├── /profile (user stats & settings)
└── /matches (match history)
```

### Component Architecture
```
App
├── Layout (navigation, auth state)
├── Dashboard
│   ├── QuickStats (elo, recent matches)
│   ├── UpcomingSessions
│   └── QuickActions (create/browse buttons)
├── SessionBrowser
│   ├── FilterPanel
│   ├── SessionList
│   └── SessionCard
├── SessionCreator
│   └── SessionForm
├── SessionDetail
│   ├── SessionInfo
│   ├── JoinButton
│   └── RequestsList (for creators)
└── Profile
    ├── UserStats
    └── MatchHistory
```

## Database Operations (Supabase)

### Key Queries
```sql
-- Find compatible sessions for user
SELECT * FROM sessions 
WHERE status = 'open' 
  AND skill_min <= user_elo 
  AND skill_max >= user_elo
  AND date_time > NOW()
ORDER BY date_time ASC;

-- Get user's upcoming sessions
SELECT s.*, mr.status as request_status
FROM sessions s
LEFT JOIN match_requests mr ON s.id = mr.session_id
WHERE (s.creator_id = user_id OR mr.requester_id = user_id)
  AND s.date_time > NOW()
  AND (s.status != 'cancelled' AND mr.status != 'declined');

-- Calculate user stats
SELECT 
  COUNT(*) as total_matches,
  AVG(CASE WHEN winner_id = user_id THEN 1 ELSE 0 END) as win_rate,
  MAX(elo_rating) as peak_elo
FROM completed_matches cm
JOIN users u ON (cm.player1_id = user_id OR cm.player2_id = user_id);
```

### Real-time Subscriptions
```javascript
// Listen for new sessions in user's skill range
supabase
  .channel('new-sessions')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'sessions',
    filter: `skill_min=lte.${userElo}&skill_max=gte.${userElo}`
  }, handleNewSession)

// Listen for match request responses
supabase
  .channel('match-requests')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public', 
    table: 'match_requests',
    filter: `requester_id=eq.${userId}`
  }, handleRequestUpdate)
```

## MVP Development Phases

### Phase 1: Authentication & Core Pages (4 hours)
- Set up Next.js + Clerk + Supabase
- Create basic page structure
- Implement user onboarding
- Deploy to Vercel

### Phase 2: Session Management (6 hours)  
- Build session creation form
- Implement session browsing with filters
- Add join request functionality
- Basic session detail pages

### Phase 3: Matching & ELO (4 hours)
- Implement match confirmation flow
- Add ELO calculation system
- Create basic match completion flow
- User profile with stats

### Phase 4: Polish & Testing (2 hours)
- Error handling
- Loading states
- Mobile responsiveness
- End-to-end testing

## Success Metrics Implementation
```javascript
// Track key metrics
const metrics = {
  sessions_created_per_user_per_week: () => {
    // Query sessions created in last 7 days by user
  },
  
  session_match_rate: () => {
    // (sessions with accepted requests / total sessions) * 100
  },
  
  median_time_to_match: () => {
    // Median time between session creation and first accepted request
  }
}
```