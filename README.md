# KP Dev Cell Official Website

Production-grade implementation of the `ARCHITECTURE.md` system for Kamand Prompt, the official programming club of IIT Mandi.

## Stack

- Frontend: React + Vite + Tailwind CSS + Axios + Supabase JS Auth
- Backend: FastAPI + Pydantic + `supabase-py` + `python-jose`
- Data/Auth: PostgreSQL on Supabase + Supabase Auth
- Infra: Docker + Docker Compose + Nginx

## Setup

1. Fill `backend/.env` from `backend/.env.example` and `frontend/.env` from `frontend/.env.example` with your real Supabase project values.
2. Ensure your Supabase admin users have `app_metadata.role = "admin"` in Supabase Auth. The app also accepts `user_metadata.role` as a backward-compatible fallback.
3. Run `docker compose up --build` from the repo root.
4. Open `http://localhost:3000` for the app and `http://localhost:8000/docs` for FastAPI docs.

## System Notes

- Public pages load all dynamic content through FastAPI; there is no hardcoded showcase data in React pages.
- Admin routes require a Supabase JWT and `app_metadata.role === "admin"`; `user_metadata.role` is accepted only as a fallback for older users.
- The frontend keeps the access token in memory through `AuthContext`; the app does not manually write auth tokens to `localStorage`.
- The backend uses the Supabase anon key so RLS remains in force instead of being bypassed by a service role.

## File Inventory

### Root / Infrastructure

- `ARCHITECTURE.md`: Canonical architecture contract for the full stack; input is product/system requirements; output is implementation constraints followed by this repository.
- `docker-compose.yml`: Orchestrates `backend` and `frontend`; input is service build contexts and `backend/.env`; output is the local multi-container topology; connects React/Nginx to FastAPI.
- `supabase/seed_public_content.sql`: Supabase-ready SQL seed for verified public club data; input is confirmed Kamand Prompt public information; output is starter project records and manual templates for missing data; used in Supabase SQL Editor to bootstrap real content safely.
- `supabase/contact_messages.sql`: Supabase SQL for the public contact inbox table and RLS policies; input is contact submissions from the website; output is persisted `contact_messages` rows with public insert and admin-only read access; run this in Supabase before using the contact form.
- `cmd.txt`: Local command reference for common run/debug workflows; input is developer setup choices; output is quick operational commands for Docker and local runs.
- `.gitignore`: Hides `.env`, build output, caches, and local tooling files; input is generated artifacts; output is a clean repo state; protects secrets and runtime noise.
- `.dockerignore`: Filters noisy root files from Docker contexts where applicable; input is local dev artifacts; output is smaller build contexts; complements containerized builds.
- `package-lock.json`: Root lockfile used by workspace-level npm operations; input is resolved package graph; output is deterministic installs at root scope.
- `README.md`: Setup, runtime notes, and per-file documentation; input is the built repo structure; output is evaluator-facing guidance; explains how all layers fit.

### Backend

- `backend/Dockerfile`: Builds the FastAPI service on Python 3.11; input is `requirements.txt` plus backend source; output is a Uvicorn-ready container; used by Compose.
- `backend/.dockerignore`: Excludes caches, env files, and virtualenv folders from backend image builds; input is backend build context noise; output is a smaller Docker context; keeps backend container builds lean.
- `backend/requirements.txt`: Pins backend dependencies; input is Python package requirements; output is a reproducible environment; supports FastAPI, Supabase, JWT, and validation.
- `backend/.env.example`: Documents required backend env vars; input is deployment configuration; output is a copyable template; drives FastAPI, CORS, and Supabase connectivity.
- `backend/app/main.py`: Initializes FastAPI, CORS, exception handlers, health route, and all routers; input is requests plus imported routers; output is the ASGI app; central backend entrypoint.
- `backend/app/config.py`: Defines `Settings`; input is `backend/.env`; output is shared typed config; imported by app startup, auth, and Supabase client helpers.
- `backend/app/db/client.py`: Exposes `get_supabase()` and `get_postgrest_client()`; input is backend settings and optional caller JWT; output is cached or request-scoped database clients; keeps backend DB access consistent and RLS-aware.
- `backend/app/middleware/auth.py`: Defines `verify_admin()`; input is Bearer credentials; output is decoded JWT metadata or 401/403 JSON; guards every admin route.
- `backend/app/exceptions/handlers.py`: Defines `error_payload()`, `raise_not_found()`, `raise_conflict()`, and global handlers; input is FastAPI/validation/PostgREST errors; output is structured JSON errors; standardizes backend failure behavior.

#### Backend Models

- `backend/app/models/member.py`: Defines `MemberCreate`, `MemberUpdate`, and `MemberResponse`; input is member payloads; output is validated API contracts; used by member CRUD routes.
- `backend/app/models/project.py`: Defines project status, contributor models, `ProjectCreate`, `ProjectUpdate`, and `ProjectResponse`; input is project CRUD payloads; output is validated project plus contributor shapes; used by project routes and admin forms.
- `backend/app/models/event.py`: Defines `EventCreate`, `EventUpdate`, and `EventResponse`; input is event forms; output is validated event records; used by public and admin event endpoints.
- `backend/app/models/timeline.py`: Defines `TimelineCreate`, `TimelineUpdate`, and `TimelineResponse`; input is milestone payloads; output is validated timeline data; used by timeline routes and public history rendering.
- `backend/app/models/announcement.py`: Defines `AnnouncementCreate`, `AnnouncementUpdate`, and `AnnouncementResponse`; input is draft/publish payloads; output is validated announcement records; used by announcement routes.
- `backend/app/models/application.py`: Defines `ApplicationCreate`, `ApplicationStatusUpdate`, and `ApplicationResponse`; input is join-form submissions and admin status changes; output is validated application contracts; used by public apply and admin review flows.
- `backend/app/models/contact.py`: Defines `ContactMessageCreate` and `ContactMessageResponse`; input is public contact-form submissions; output is validated contact message contracts; used by the contact API route.

#### Backend Routers

- `backend/app/routers/members.py`: Implements public member reads and admin member CRUD; input is `/api/members` requests and protected admin payloads; output is member JSON plus delete flags; powers team pages and admin member management.
- `backend/app/routers/projects.py`: Implements public project reads, featured reads, admin project CRUD, and project-member linking; input is project payloads plus contributor arrays; output is project JSON enriched with contributor snapshots; powers showcase and admin project management.
- `backend/app/routers/events.py`: Implements public event reads, upcoming reads, and admin event CRUD; input is event payloads; output is event JSON; powers events page and admin event management.
- `backend/app/routers/timeline.py`: Implements public milestone reads and admin timeline CRUD; input is milestone payloads; output is ordered timeline JSON; powers public history and admin milestone management.
- `backend/app/routers/announcements.py`: Implements public published announcement reads and admin draft/publish CRUD; input is announcement payloads; output is announcement JSON with publish timestamps; powers homepage/public notices and admin publishing.
- `backend/app/routers/applications.py`: Implements public `POST /api/apply` and admin application review/status updates; input is application forms and status payloads; output is stored application JSON; powers recruitment and admin decision flow.
- `backend/app/routers/contact_messages.py`: Implements public `POST /api/contact` and admin `GET /api/admin/contact-messages`; input is public contact payloads plus protected admin reads; output is stored contact-message JSON and inbox lists; powers both the website contact page and the admin contact inbox.

### Frontend

- `frontend/Dockerfile`: Multi-stage React build plus Nginx runtime; input is frontend source and `package.json`; output is a small static-serving image; used by Compose.
- `frontend/.dockerignore`: Excludes `node_modules`, `dist`, and local env files from frontend image builds; input is generated frontend artifacts; output is a smaller Docker context; keeps image builds predictable.
- `frontend/nginx.conf`: Configures SPA fallback with `try_files`; input is incoming browser paths; output is `index.html` for client-side routes; required for refresh/deep-link support.
- `frontend/.env.example`: Documents frontend runtime/build env vars; input is API and Supabase public values; output is a copyable template; feeds Vite and the auth client.
- `frontend/.env`: Local frontend env file for this workspace; input is local API and Supabase values; output is Vite config at build/dev time; keeps runtime config in the expected folder.
- `frontend/index.html`: Browser shell and metadata; input is Vite bundle output; output is the root mount point and SEO metadata; hosts the React app.
- `frontend/package.json`: Declares frontend dependencies and scripts; input is package metadata; output is reproducible installs and build commands; drives local and Docker builds.
- `frontend/package-lock.json`: Lockfile generated from `npm install`; input is resolved npm dependencies; output is deterministic frontend installs; used by Docker and local builds.
- `frontend/boneyard.config.json`: Configures responsive bone capture output for `boneyard-js`; input is local dev-server snapshot settings; output is generated skeleton files under `src/bones`; used to extract UI-matched loading screens from the real app.
- `frontend/vite.config.js`: Configures the Vite dev/build pipeline; input is React plugin settings; output is frontend bundling behavior; used in dev and production builds.
- `frontend/tailwind.config.js`: Enables Tailwind scanning and theme tokens; input is project file globs and custom colors; output is generated utility classes; styles the React UI.
- `frontend/postcss.config.js`: Wires Tailwind and Autoprefixer into CSS processing; input is CSS build steps; output is compiled stylesheet transforms; part of the Vite build chain.
- `frontend/src/main.jsx`: Mounts React into `#root`; input is `App.jsx`; output is the running SPA inside `BrowserRouter`; frontend bootstrap.
- `frontend/src/assets/kp-logo.png`: Primary logo used in navbar/footer/admin UI; input is exported brand image; output is consistent in-app identity visuals.
- `frontend/src/bones/registry.js`: Initializes the `boneyard-js` registry import path; input is generated or registered bones; output is globally available skeleton layouts; imported once at app startup.
- `frontend/src/App.jsx`: Declares public/admin route trees, layouts, theme state, and protected admin area; input is current route and auth state; output is routed page rendering; central frontend entrypoint.
- `frontend/src/index.css`: Defines Tailwind layers, shared classes, theme styling, and design tokens; input is Tailwind processing; output is the app stylesheet; shared by all pages and components.

#### Frontend Auth / Library / Hooks

- `frontend/src/context/AuthContext.jsx`: Provides `AuthProvider`, `login`, `logout`, and in-memory session state; input is Supabase auth events and login credentials; output is shared auth/session context; integrates Axios interceptors with route protection.
- `frontend/src/lib/supabase.js`: Creates the frontend Supabase client; input is `VITE_SUPABASE_*` env vars; output is a configured auth client with `persistSession: false`; used only for frontend auth.
- `frontend/src/lib/api.js`: Creates the shared Axios instance plus request/response interceptors; input is API base URL and current access token; output is authenticated HTTP requests and normalized errors; used by every service file.
- `frontend/src/hooks/useAuth.js`: Thin hook over `AuthContext`; input is provider state; output is auth helpers; consumed by routes, layouts, and login/logout actions.
- `frontend/src/hooks/useFetch.js`: Generic loading/error/data hook with `refetch`; input is any async fetcher; output is request state and refresh control; used by public and admin pages.

#### Frontend Services

- `frontend/src/services/memberService.js`: Wraps member API calls; input is member CRUD payloads; output is parsed Axios JSON; consumed by team pages and admin member screens.
- `frontend/src/services/projectService.js`: Wraps project API calls; input is project CRUD payloads; output is project JSON; consumed by home/projects pages and admin project management.
- `frontend/src/services/eventService.js`: Wraps event API calls; input is event CRUD payloads; output is event JSON; consumed by events pages and admin event management.
- `frontend/src/services/timelineService.js`: Wraps timeline API calls; input is milestone CRUD payloads; output is ordered milestone JSON; consumed by home page and admin timeline management.
- `frontend/src/services/announcementService.js`: Wraps published/admin announcement API calls; input is announcement CRUD payloads; output is announcement JSON; consumed by home page and admin announcement management.
- `frontend/src/services/applicationService.js`: Wraps public application submission and admin review calls; input is application forms or status payloads; output is application JSON; consumed by apply and applications pages.
- `frontend/src/services/contactService.js`: Wraps public contact submission and admin inbox fetch calls; input is contact payloads or admin session state; output is stored contact-message JSON and inbox lists; consumed by the contact page and admin contact inbox.

#### Frontend Common Components

- `frontend/src/components/common/Navbar.jsx`: Public site header and nav; input is route state, auth presence, and theme toggle props; output is top-level navigation UI; shared across public pages.
- `frontend/src/components/common/Particles.jsx`: Renders the OGL-based particle background globally across public and admin routes; input is particle count/spread/speed/theme color props; output is a full-screen animated canvas background.
- `frontend/src/components/common/Particles.css`: Defines container/canvas sizing for the OGL particle background; input is global background layout; output is proper full-screen canvas behavior.
- `frontend/src/components/common/BounceCards.jsx`: Animated GSAP card-stack component for clickable project/event highlights; input is card data (title, badge, description, links, optional image); output is interactive stacked showcase cards.
- `frontend/src/components/common/BounceCards.css`: Styling layer for BounceCards layout, typography, and hover presentation; input is card-stack design tokens; output is polished interactive card visuals.
- `frontend/src/components/common/Antigravity.jsx`: Legacy three.js background component retained for experimentation; input is particle-field props; output is an alternative animated scene that is currently not mounted in `App.jsx`.
- `frontend/src/components/common/Footer.jsx`: Public site footer; input is static club/contact copy; output is footer UI; closes the public layout.
- `frontend/src/components/common/LoadingSpinner.jsx`: Shared loading view; input is a label; output is a spinner block; used anywhere async data is pending.
- `frontend/src/components/common/BoneyardFallbacks.jsx`: Shared DOM fixtures and fallbacks for `boneyard-js` capture; input is page loading state; output is layout-shaped skeleton placeholders for public pages; used by homepage, projects, team, and events screens.
- `frontend/src/components/common/SkeletonCard.jsx`: Shared skeleton placeholder; input is line count; output is a loading card; used on the homepage.
- `frontend/src/components/common/ErrorMessage.jsx`: Shared error state UI; input is an error message and optional retry callback; output is retryable error feedback; used by public and admin pages.
- `frontend/src/components/common/ConfirmModal.jsx`: Shared delete confirmation dialog; input is open state, copy, and callbacks; output is a modal confirmation flow; required before destructive admin actions.
- `frontend/src/components/common/Toast.jsx`: Shared success/error toast; input is toast state and close callback; output is timed transient feedback; used by forms and admin actions.
- `frontend/src/components/common/ThemeToggle.jsx`: Shared dark/light mode button; input is theme state and toggle callback; output is a theme switch control; used in public and admin layouts.

#### Frontend Public Components

- `frontend/src/components/public/HeroSection.jsx`: Homepage hero and CTA block; input is computed live stats; output is the homepage lead section; fed by `HomePage`.
- `frontend/src/components/public/ProjectCard.jsx`: Project presentation card; input is one project record; output is project summary UI with links and contributors; used on home and projects pages.
- `frontend/src/components/public/MemberCard.jsx`: Team presentation card; input is one member record; output is member profile UI; used on home and team pages.
- `frontend/src/components/public/EventCard.jsx`: Event/session presentation card; input is one event record; output is event summary UI; used on events pages.
- `frontend/src/components/public/TimelineItem.jsx`: Timeline milestone item; input is one milestone record; output is chronological history UI; used on the homepage.
- `frontend/src/components/public/StatsBar.jsx`: Live stats strip; input is derived counts; output is stat cards; used on the homepage.
- `frontend/src/components/public/AnnouncementCard.jsx`: Announcement presentation card; input is one published announcement; output is announcement UI; used on the homepage.

#### Frontend Admin Components

- `frontend/src/components/admin/AdminSidebar.jsx`: Admin navigation rail with logout and theme controls; input is theme/logout props; output is admin navigation UI; shared by all protected admin routes.
- `frontend/src/components/admin/MemberForm.jsx`: Member CRUD form; input is optional member initial data and submit callbacks; output is normalized member payloads; used by `ManageMembers`.
- `frontend/src/components/admin/ProjectForm.jsx`: Project CRUD form with contributor editing; input is project initial data, active members list, and callbacks; output is project plus contributor payloads; used by `ManageProjects`.
- `frontend/src/components/admin/EventForm.jsx`: Event CRUD form; input is event initial data and callbacks; output is event payloads; used by `ManageEvents`.
- `frontend/src/components/admin/TimelineForm.jsx`: Timeline CRUD form; input is milestone initial data and callbacks; output is milestone payloads; used by `ManageTimeline`.
- `frontend/src/components/admin/AnnouncementForm.jsx`: Announcement CRUD form; input is announcement initial data and callbacks; output is draft/publish payloads; used by `ManageAnnouncements`.

#### Frontend Public Pages

- `frontend/src/pages/public/HomePage.jsx`: Loads featured projects, active members, milestones, and published announcements in parallel; input is service-layer API data; output is the complete homepage; connects multiple public endpoints into one view.
- `frontend/src/pages/public/ProjectsPage.jsx`: Loads all projects; input is `projectService.getAll()`; output is the public project archive page; uses `ProjectCard`.
- `frontend/src/pages/public/TeamPage.jsx`: Loads all active members; input is `memberService.getAll()`; output is the public team page; uses `MemberCard`.
- `frontend/src/pages/public/EventsPage.jsx`: Loads all events plus upcoming events; input is event service calls; output is the public events page; uses `EventCard`.
- `frontend/src/pages/public/ApplyPage.jsx`: Handles the join application form; input is applicant form state; output is `POST /api/apply` submissions plus toast feedback; connects public recruitment UI to backend persistence.
- `frontend/src/pages/public/ContactPage.jsx`: Terminal-style public contact page; input is visitor name/email/message plus direct contact links; output is `POST /api/contact` submissions with success/error feedback; connects website inquiries to Supabase persistence.
- `frontend/src/pages/public/NotFound.jsx`: Custom SPA 404 page; input is unmatched routes; output is a user-facing error page with a route back home; catches bad client-side paths.

#### Frontend Admin Pages

- `frontend/src/pages/admin/AdminLoginPage.jsx`: Handles Supabase email/password login; input is credentials; output is authenticated admin session state and redirect; entrypoint to the protected portal.
- `frontend/src/pages/admin/AdminDashboard.jsx`: Loads summary metrics for members, projects, events, milestones, announcements, and applications; input is parallel admin service calls; output is the admin overview; surfaces system state quickly.
- `frontend/src/pages/admin/ManageMembers.jsx`: Member CRUD screen with toasts and confirm-before-delete; input is member form actions; output is create/update/delete calls and refreshed lists; manages the team dataset.
- `frontend/src/pages/admin/ManageProjects.jsx`: Project CRUD screen with contributor selection; input is project form state and active members; output is project mutations and refreshed lists; manages showcase content plus junction-table links.
- `frontend/src/pages/admin/ManageEvents.jsx`: Event CRUD screen; input is event form state; output is event mutations and refreshed lists; manages the events dataset.
- `frontend/src/pages/admin/ManageTimeline.jsx`: Timeline CRUD screen; input is milestone form state; output is milestone mutations and refreshed lists; manages public club history.
- `frontend/src/pages/admin/ManageAnnouncements.jsx`: Announcement CRUD screen for drafts and published posts; input is announcement form state; output is announcement mutations and refreshed lists; manages public communications.
- `frontend/src/pages/admin/ViewApplications.jsx`: Application review screen; input is admin status changes; output is application status updates and refreshed lists; manages recruitment decisions.
- `frontend/src/pages/admin/ViewContactMessages.jsx`: Contact inbox screen; input is admin-authenticated message fetches; output is a readable list of saved contact submissions with reply links; manages public website inquiries.

#### Frontend Routing

- `frontend/src/router/ProtectedRoute.jsx`: Redirects unauthenticated or non-admin users to `/admin/login`; input is `AuthContext` session state; output is either protected content or a redirect; enforces frontend portal access.

## Verification

- Frontend production bundle verified with `npm run build` inside `frontend/`.
- Backend import and route registration verified with `python` from `backend/`.
- FastAPI smoke checks verified `200 /health`, `401` missing token, `401` invalid token, `403` non-admin token, and `422` invalid admin payload with a valid admin token.
- `docker compose config` verified the new Compose topology. Building images requires a running Docker daemon plus real Supabase credentials.
