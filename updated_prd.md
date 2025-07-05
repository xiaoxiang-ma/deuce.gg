# RallyPoint MVP - Updated PRD & Implementation Guide

## Project Status Overview

### ✅ COMPLETED (Already Implemented)
- **Authentication**: Clerk integration with protected routes
- **User Management**: Onboarding flow with skill level setup
- **Session Creation**: Form-based session creation with all required fields
- **Session Browsing**: Filterable session list with skill-based matching
- **Database Schema**: Core tables (users, sessions, match_requests, completed_matches)
- **Infrastructure**: Next.js + Supabase + Clerk + Vercel deployment

### 🔄 IN PROGRESS (Current Sprint)
- **Session Detail Page**: Individual session view with join functionality
- **Match Request System**: Request creation and management
- **Profile Page**: User stats and match history
- **Database Policies**: Row Level Security (RLS) implementation

### ⏳ NEXT SPRINT (This Implementation)
- **Session Request Flow**: Complete request → accept → confirm → complete cycle
- **Match Completion**: Post-session result reporting and ELO updates
- **Real-time Notifications**: Live updates for requests and confirmations
- **Mobile Polish**: Responsive design improvements

## Implementation Requirements

### 1. Session Detail Page Enhancement
**File**: `src/app/sessions/[id]/page.tsx`
**Requirements**:
- Display complete session information
- Show creator profile summary
- Implement "Request to Join" button with message field
- Real-time updates for session status changes
- Handle different states (open, requested, confirmed, completed)

### 2. Match Request System
**Files**: 
- `src/app/sessions/[id]/components/RequestButton.tsx`
- `src/app/sessions/[id]/components/RequestList.tsx`
- `src/app/api/sessions/[id]/request/route.ts`

**Requirements**:
- Request creation with optional message
- Creator request management (accept/decline)
- Real-time request status updates
- Email/in-app notifications

### 3. Session Confirmation Flow
**Files**:
- `src/app/sessions/[id]/components/ConfirmationStatus.tsx`
- `src/app/api/sessions/[id]/confirm/route.ts`

**Requirements**:
- Two-stage confirmation (both players must confirm)
- Automatic session expiration if not confirmed
- Pre-session reminders
- Cancel/withdraw functionality

### 4. Session Completion System
**Files**:
- `src/app/sessions/[id]/components/CompletionForm.tsx`
- `src/app/api/sessions/[id]/complete/route.ts`
- `src/lib/elo-calculator.ts`

**Requirements**:
- Post-session completion reporting
- Match result entry (winner, type of play)
- ELO calculation and updates
- Conflict resolution for mismatched results

## Database Schema Updates

### Required New Tables

#### session_completions
```sql
CREATE TABLE session_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id TEXT REFERENCES users(id),
  did_attend BOOLEAN NOT NULL,
  match_played BOOLEAN,
  reported_winner TEXT REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  type TEXT NOT NULL, -- 'REQUEST_RECEIVED', 'REQUEST_ACCEPTED', etc.
  title TEXT NOT NULL,
  message TEXT,
  data JSONB, -- Additional context data
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Required Schema Updates

#### sessions table additions
```sql
ALTER TABLE sessions ADD COLUMN creator_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN joiner_confirmed BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN expires_at TIMESTAMP;
```

#### match_requests table additions
```sql
ALTER TABLE match_requests ADD COLUMN responded_at TIMESTAMP;
ALTER TABLE match_requests ADD COLUMN joiner_id TEXT REFERENCES users(id);
```

## API Endpoints to Implement

### Session Management
```typescript
// GET /api/sessions/[id] - Get session details with requests
// POST /api/sessions/[id]/request - Create join request
// PATCH /api/sessions/[id]/request/[requestId] - Accept/decline request
// POST /api/sessions/[id]/confirm - Confirm attendance
// POST /api/sessions/[id]/complete - Submit completion report
```

### Notifications
```typescript
// GET /api/notifications - Get user notifications
// PATCH /api/notifications/[id] - Mark as read
// POST /api/notifications/send - Send notification (internal)
```

### User Management
```typescript
// GET /api/users/[id]/stats - Get user statistics
// PATCH /api/users/[id]/elo - Update ELO rating (internal)
```

## Component Architecture

### Session Detail Page Components
```typescript
SessionDetailPage/
├── SessionInfo.tsx           // Basic session details
├── CreatorProfile.tsx        // Creator information
├── RequestButton.tsx         // Join request functionality
├── RequestList.tsx          // Creator's view of requests
├── ConfirmationStatus.tsx   // Confirmation tracking
├── CompletionForm.tsx       // Post-session reporting
└── SessionActions.tsx       // Cancel/withdraw actions
```

### Dashboard Components
```typescript
Dashboard/
├── UpcomingSessions.tsx     // Confirmed sessions
├── PendingRequests.tsx      // Requests awaiting response
├── RecentMatches.tsx        // Match history
├── QuickStats.tsx           // ELO, win rate, etc.
└── NotificationBell.tsx     // Real-time notifications
```

## Real-time Subscriptions

### Session Page Subscriptions
```typescript
// Subscribe to session updates
useEffect(() => {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sessions',
      filter: `id=eq.${sessionId}`
    }, handleSessionUpdate)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'match_requests',
      filter: `session_id=eq.${sessionId}`
    }, handleRequestUpdate)
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [sessionId]);
```

### Notification System
```typescript
// Global notification subscription
useEffect(() => {
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, handleNewNotification)
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, [userId]);
```

## ELO Rating System

### Calculation Logic
```typescript
interface EloCalculation {
  player1_elo_before: number;
  player2_elo_before: number;
  winner_id: string | null; // null for tie/practice
  k_factor: number; // 32 for new players, 16 for experienced
}

function calculateEloChange(params: EloCalculation): {
  player1_elo_after: number;
  player2_elo_after: number;
} {
  const { player1_elo_before, player2_elo_before, winner_id, k_factor } = params;
  
  // Expected scores
  const expected1 = 1 / (1 + Math.pow(10, (player2_elo_before - player1_elo_before) / 400));
  const expected2 = 1 - expected1;
  
  // Actual scores
  let actual1: number, actual2: number;
  if (winner_id === null) {
    actual1 = actual2 = 0.5; // Tie or practice
  } else {
    actual1 = winner_id === 'player1' ? 1 : 0;
    actual2 = winner_id === 'player2' ? 1 : 0;
  }
  
  // Calculate new ratings
  const player1_elo_after = Math.round(player1_elo_before + k_factor * (actual1 - expected1));
  const player2_elo_after = Math.round(player2_elo_before + k_factor * (actual2 - expected2));
  
  return { player1_elo_after, player2_elo_after };
}
```

## Error Handling & Edge Cases

### Concurrent Request Handling
- Implement optimistic locking for session updates
- Handle race conditions when multiple users request same session
- Prevent double-booking (user has overlapping sessions)

### Session Expiration Logic
- Auto-expire sessions that aren't confirmed within 24 hours
- Clean up expired sessions and notify users
- Handle timezone differences for expiration calculations

### Conflict Resolution
- When completion reports don't match, flag for manual review
- Implement dispute resolution workflow
- Track user reputation for frequent conflicts

## Testing Strategy

### Unit Tests
- ELO calculation functions
- Session state transitions
- Request validation logic

### Integration Tests
- Complete session flow (create → request → confirm → complete)
- Real-time subscription handling
- Database constraint validation

### E2E Tests
- User journey from session creation to completion
- Multi-user session interactions
- Mobile responsiveness

## Performance Considerations

### Database Indexing
```sql
-- Optimize session queries
CREATE INDEX idx_sessions_status_datetime ON sessions(status, date_time);
CREATE INDEX idx_sessions_skill_range ON sessions(skill_min, skill_max);
CREATE INDEX idx_match_requests_session_status ON match_requests(session_id, status);
```

### Caching Strategy
- Cache user profiles and stats
- Cache session lists with invalidation
- Use Supabase's built-in query caching

## Deployment & Monitoring

### Environment Variables
```bash
# Already configured
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Additional for notifications
RESEND_API_KEY (for emails)
NEXT_PUBLIC_APP_URL
```

### Success Metrics
- Session completion rate (target: >80%)
- Request acceptance rate (target: >60%)
- Time to match (target: <2 hours median)
- User retention (target: >50% monthly active)

## Next Steps Priority

1. **Session Detail Page** - Core functionality for viewing and requesting
2. **Request Management** - Accept/decline with real-time updates
3. **Confirmation System** - Two-stage commitment process
4. **Completion Tracking** - Post-session reporting and ELO updates
5. **Notification System** - Real-time alerts and email notifications
6. **Mobile Polish** - Responsive design and touch interactions

This PRD provides a complete roadmap for implementing the remaining session management features while building on your existing foundation.