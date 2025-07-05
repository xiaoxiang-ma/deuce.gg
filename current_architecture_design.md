# RallyPoint Tennis Matchmaking - Current Architecture Design

## System Overview

RallyPoint is a web-based tennis matchmaking platform that connects players based on skill level, location, and availability. The system facilitates session creation, player matching, and skill-based rating tracking.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router for server-side rendering and routing
- **TailwindCSS** - Utility-first CSS framework for styling
- **TypeScript** - Type-safe JavaScript development

### Backend & Infrastructure
- **Supabase** - PostgreSQL database with real-time capabilities
  - Database hosting
  - Row Level Security (RLS)
  - Real-time subscriptions
  - PostgREST API
- **Clerk** - Authentication and user management
- **Vercel** - Hosting and deployment platform

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (sign-in, sign-up)
│   ├── dashboard/         # User dashboard
│   ├── matches/          # Match history and completion
│   ├── onboarding/       # New user onboarding flow
│   ├── profile/          # User profile management
│   ├── sessions/         # Session management
│   │   ├── [id]/        # Individual session view
│   │   ├── browse/      # Session browsing
│   │   └── create/      # Session creation
│   └── layout.tsx        # Root layout with navigation
├── lib/                   # Shared utilities
│   ├── supabase.ts       # Supabase client configuration
│   └── debug-utils.ts    # Debugging helpers
└── middleware.ts         # Authentication middleware

supabase/
└── migrations/           # Database schema and RLS policies
```

## Core Components

### 1. Authentication & User Management
- Implemented using Clerk
- Protected routes with middleware
- User onboarding flow for skill level and preferences
- Integration with Supabase for user data storage

### 2. Session Management
- Create tennis sessions with:
  - Location and time
  - Skill range requirements
  - Session type (match, rally, drills)
  - Player capacity
- Real-time session status updates
- Match request handling system

### 3. Database Schema

#### Users Table
```sql
users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  skill_level NUMERIC(3,1),
  elo_rating INTEGER,
  location_preference TEXT
)
```

#### Sessions Table
```sql
sessions (
  id UUID PRIMARY KEY,
  creator_id TEXT,
  title TEXT,
  location TEXT,
  date_time TIMESTAMP,
  duration INTEGER,
  intent session_intent,
  skill_min NUMERIC(3,1),
  skill_max NUMERIC(3,1),
  max_players INTEGER,
  current_players INTEGER,
  status session_status
)
```

#### Match Requests Table
```sql
match_requests (
  id UUID PRIMARY KEY,
  session_id UUID,
  requester_id TEXT,
  status TEXT,
  message TEXT
)
```

#### Completed Matches Table
```sql
completed_matches (
  id UUID PRIMARY KEY,
  session_id UUID,
  player1_id TEXT,
  player2_id TEXT,
  winner_id TEXT,
  player1_elo_before INTEGER,
  player2_elo_before INTEGER,
  player1_elo_after INTEGER,
  player2_elo_after INTEGER
)
```

## Security Model

### Row Level Security (RLS) Policies
- Session visibility based on status and participation
- Match request access control
- User profile protection
- Completed match visibility

### Data Access Patterns
1. Public Access
   - Open sessions listing
   - Basic user profiles

2. Authenticated Access
   - Session creation and management
   - Match request creation
   - Profile updates
   - Match history

## Real-time Features

### Supabase Subscriptions
- Session status updates
- Match request notifications
- Player joining/leaving updates

## ELO Rating System

- Initial rating based on self-reported skill level
- Rating adjustments after completed matches
- Configurable K-factor for rating changes
- Skill range matching for fair play

## Current Implementation Status

### Completed Features ✅
- User authentication
- Session creation
- Session browsing with filters

### In Progress 🔄
- Individual session page improvements
- Match request system
- Profile page implementation
- Match history tracking
- ELO rating updates
- Database schema and RLS policies

### Pending Features ⏳
- Real-time notifications
- Location-based matching
- Advanced filtering options
- Mobile responsiveness improvements
