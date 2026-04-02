# EventCommand — Event Command Center

## Project Overview
EventCommand is a full-stack event management command center designed for the Eventbrite Marketplace. It allows users to create events, sync them to Eventbrite and Wix Events, follow organizers, and monitor sync status.

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS v3
- **Routing:** React Router v6
- **Data Fetching:** TanStack Query v5
- **Icons:** Material Symbols (Google Fonts)
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (raw SQL, no ORM)
- **HTTP Client:** axios

## Project Structure
```
eventcommand/
  frontend/          → React + Vite app (port 5173)
  backend/           → Express API server (port 3001)
```

## Running the App
```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev
```

## Environment Variables (backend/.env)
- `DATABASE_URL` — PostgreSQL connection string
- `EVENTBRITE_TOKEN` — Eventbrite API OAuth token
- `WIX_API_KEY` — Wix Events API key

## API Routes
- `GET    /api/events` — List all events
- `POST   /api/events` — Create event + trigger sync
- `PUT    /api/events/:id` — Update event + trigger sync
- `DELETE /api/events/:id` — Delete event
- `GET    /api/organizations` — List followed orgs
- `POST   /api/organizations/follow` — Follow an org
- `DELETE /api/organizations/:id` — Unfollow org
- `GET    /api/sync/:eventId` — Get sync log
- `POST   /api/sync/:eventId/retry` — Retry failed sync
- `GET    /api/auth/eventbrite` — Start Eventbrite OAuth flow
- `GET    /api/auth/eventbrite/callback` — OAuth callback (exchanges code for token)
- `GET    /api/auth/status` — Check platform connection status
- `POST   /api/webhooks/eventbrite` — Eventbrite webhook receiver

## Eventbrite Marketplace
This app is built for the Eventbrite Marketplace. It uses the Eventbrite API v3 for:
- Creating and updating events on Eventbrite
- Fetching organizer information
- Syncing event data bidirectionally

### Eventbrite API Endpoints Used
- `POST /v3/organizations/:orgId/events/` — Create event
- `POST /v3/events/:eventId/` — Update event
- `DELETE /v3/events/:eventId/` — Delete event
- `GET /v3/organizations/:orgId/events/` — List org events
- `GET /v3/organizations/:orgId/` — Get org details

## Database
PostgreSQL with 3 tables:
- `events` — Core event data with sync status
- `followed_orgs` — Eventbrite organizers being followed
- `sync_log` — Sync attempt history

## UI Design System
- Background: #FAFAFA
- Cards: white, 1px #EBEBEB border, 14px radius
- Primary buttons: black pill (#0A0A0A)
- Font: Inter
- Sync badge colors: green (synced), amber (pending), red (failed), gray (not_synced)

## Development Notes
- Mock data is used in frontend; real API calls marked with `// TODO: connect to API`
- Backend services (eventbriteService, wixService) contain placeholder logic
- All sync operations are async and logged to sync_log table

## Eventbrite Marketplace Submission Checklist
To get EventCommand listed on the Eventbrite App Marketplace:

### Already Built
- [x] OAuth 2.0 flow (`/api/auth/eventbrite` + callback)
- [x] Eventbrite API v3 integration (create/update/delete events)
- [x] Webhook endpoint (`/api/webhooks/eventbrite`)
- [x] Organizer following via API
- [x] Sync status tracking and logging

### Still Needed
- [ ] Register app at https://www.eventbrite.com/platform/ to get Client ID + Secret
- [ ] Deploy backend with HTTPS (required for OAuth redirect and webhooks)
- [ ] Configure webhook subscriptions in Eventbrite developer dashboard (order.placed, event.updated, etc.)
- [ ] Prepare marketplace listing assets:
  - App name: "EventCommand"
  - Description: Event command center for multi-platform sync
  - Logo (200x200px PNG)
  - Screenshots of the app in action
  - Support URL / email
  - Privacy Policy URL
  - Terms of Service URL
- [ ] Submit app for review via Eventbrite developer portal or email technology-partners@eventbrite.com
- [ ] Store OAuth tokens in database (currently in-memory via process.env)
