# User Authentication Flow

This document outlines the core user authentication flow for the tennis matchmaking platform.

## Authentication and Landing Page Flow

```mermaid
flowchart TD
    A["Visitor lands on<br/>Landing Page<br/>/page.tsx"] --> B{"Is user<br/>authenticated?"}
    B -->|No| C["Landing Page Content<br/>• Value Proposition<br/>• Call to Action"]
    C -->|"Click Sign In/Sign Up"| D["Clerk Auth Pages<br/>/auth/sign-in<br/>/auth/sign-up"]
    D -->|"Successful Authentication"| E["Dashboard<br/>/dashboard"]
    B -->|Yes| E
    E --> F["Quick Stats<br/>(ELO, recent matches)"]
    E --> G["Upcoming Sessions"]
    E --> H["Quick Actions"]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#dfd,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
```

## Flow Description

1. **Initial Landing**
   - All visitors first see the landing page (`/page.tsx`)
   - Contains value proposition and call-to-action buttons

2. **Authentication Check**
   - Authenticated users are automatically redirected to dashboard
   - Non-authenticated users remain on landing page

3. **Authentication Flow**
   - Sign In/Sign Up buttons direct to Clerk authentication pages
   - Located at `/auth/sign-in` or `/auth/sign-up`

4. **Post-Authentication**
   - Successful authentication leads to dashboard
   - Dashboard displays:
     - Quick Stats
     - Upcoming Sessions
     - Quick Actions

## Implementation Notes

- Landing page should focus on converting visitors to signed-up users
- Dashboard serves as the main hub for authenticated users
- Authentication is handled entirely by Clerk
- All post-authentication pages should be protected routes 