# KP Dev Cell Official Website

Official website and admin panel for Kamand Prompt, IIT Mandi.

This README is synced to committed files only (`git ls-files`) and includes a simple file-by-file map with function/component names.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, TanStack Query
- Backend: FastAPI, Pydantic, Supabase Python client, python-jose
- Database/Auth: Supabase Postgres + Supabase Auth with backend-issued admin session cookies
- Infra: Docker, Docker Compose, Nginx

## Quick Start

1. Copy env templates:
	 - `backend/.env.example` -> `backend/.env`
	 - `frontend/.env.example` -> `frontend/.env`
2. Fill real API and Supabase values.
3. Run: `docker compose up --build`
4. Open:
	 - Frontend: `http://localhost:3000`
	 - Backend docs (non-production only): `http://localhost:8000/docs`

## Runtime Notes

- Public pages read dynamic content from backend APIs.
- Admin login is mediated by FastAPI, which issues an `HttpOnly` session cookie after verifying Supabase credentials and admin role metadata.
- Backend data access is anchored to a server credential path via `SUPABASE_SERVICE_ROLE_KEY` when configured, with a local-development fallback to the anon key.
- Admin requests are authorized by a signed backend session token in an `HttpOnly` cookie until session expiry.
- Frontend auth no longer stores admin tokens in `localStorage` or `sessionStorage`.
- Production API documentation endpoints are disabled: `/docs`, `/redoc`, and `/openapi.json`.
- Frontend runtime only needs `VITE_API_BASE_URL`; Supabase project URL and anon key are no longer shipped to the browser bundle.
- Backend uptime is handled by an external cron job that pings `/health`.

## Recent Hardening Updates (2026-04-12)

- Runtime safety:
	- `ENVIRONMENT` defaults to `production`.
	- `ADMIN_SESSION_SECRET` is required when `ENVIRONMENT=production`.
	- `docker-compose` backend command no longer uses `--reload`.
- Error handling:
	- API responses no longer include raw Python exception strings.
	- API responses no longer include raw PostgREST error JSON payloads.
	- Conflict responses are sanitized and do not forward raw DB hints/details.
- Auth and session behavior:
	- Frontend uses cookie-backed session probing for admin auth state.
	- Per-request live Supabase `get_user_by_id` lookup in `verify_admin` was removed.
	- Admin login guard (`failedAttempts`, cooldown) now survives page refresh inside the same browser session.
- Data and performance:
	- `announcement.body` now has explicit max length limits in create and update schemas.
	- Project serialization now fetches contributor/member rows scoped to requested projects instead of full-table scans.
	- In-memory rate-limit buckets now include periodic stale-key garbage collection.
- UX:
	- Apply page now has frontend validation and improved 422 field-level error messaging.

## Recent Refactor Updates (2026-04-12)

- Backend dedupe:
	- Added shared DB CRUD helpers to remove repeated create/update/delete conflict/not-found flows.
	- Added shared model validator helpers for text and empty-URL normalization.
- Frontend dedupe:
	- Added shared admin service factories for CRUD and admin-list patterns.
	- Added shared admin form/page hooks to centralize repeated state and handler logic.
	- Added shared URL normalization utility used across admin forms.
- Cleanup:
	- Removed unused visual components `Particles` and `Lanyard` (and their CSS).

## Supabase SQL Editor Order (Local Workflow)

These SQL files are intentionally local-only and ignored by git. Run them manually in Supabase SQL Editor in this order:

1. `supabase/applications.sql`
2. `supabase/contact_messages.sql`
3. `supabase/seed_public_content.sql`

What each file does:

- `supabase/applications.sql`: creates `public.applications` table and RLS policies for public submit + admin read/update.
- `supabase/contact_messages.sql`: creates `public.contact_messages` table and RLS policies for public submit + admin read.
- `supabase/seed_public_content.sql`: resets and seeds public content tables, then applies core RLS policies for `team_members`, `projects`, `project_members`, `events`, `timeline`, and `announcements`.

Important:

- `supabase/seed_public_content.sql` deletes existing rows from public content tables before reseeding.
- Re-run `supabase/seed_public_content.sql` only when you intentionally want a content reset.

## Committed File Inventory

### Root and Infra

- `.dockerignore`: Root Docker ignore rules. Functions: none.
- `.gitignore`: Git ignore rules for local/build/secrets. Functions: none.
- `README.md`: Project guide and file map. Functions: none.
- `docker-compose.yml`: Runs backend + frontend containers together. Functions: none.
- `package-lock.json`: Root npm lockfile. Functions: none.

### Backend Infra

- `backend/.dockerignore`: Backend Docker ignore rules. Functions: none.
- `backend/.env.example`: Backend env template. Functions: none.
- `backend/Dockerfile`: Backend container build and startup command. Functions: none.
- `backend/requirements.txt`: Python dependency list. Functions: none.

### Backend Core

- `backend/app/config.py`: App settings model.
	- Classes/Functions: `Settings`
- `backend/app/main.py`: FastAPI app setup, middleware, router mounting.
	- Classes/Functions: `root`, `health`
- `backend/app/db/client.py`: Supabase/PostgREST client helpers.
	- Classes/Functions: `get_supabase`, `get_auth_supabase`, `get_postgrest_client`
- `backend/app/db/crud_helpers.py`: Shared CRUD primitives for create/update/delete-by-id flows.
	- Classes/Functions: `create_record`, `update_record_by_id`, `delete_record_by_id`
- `backend/app/exceptions/handlers.py`: API error payload and common raise helpers.
	- Classes/Functions: `error_payload`, `raise_not_found`, `raise_conflict`
- `backend/app/middleware/auth.py`: Admin session cookie and authorization helpers.
	- Classes/Functions: `_extract_role`, `_extract_user_id`, `_extract_email`, `_error`, `build_admin_session`, `set_admin_session_cookie`, `clear_admin_session_cookie`, `create_admin_session_for_user`, `verify_admin`

### Backend Models

- `backend/app/models/auth.py`: Admin auth request/session schemas.
	- Classes/Functions: `AdminLoginRequest`, `AdminUserResponse`, `AdminSessionResponse`
- `backend/app/models/announcement.py`: Announcement schemas.
	- Classes/Functions: `AnnouncementBase`, `AnnouncementCreate`, `AnnouncementUpdate`, `AnnouncementResponse`
- `backend/app/models/application.py`: Application schemas.
	- Classes/Functions: `ApplicationCreate`, `ApplicationStatusUpdate`, `ApplicationResponse`
- `backend/app/models/contact.py`: Contact message schemas.
	- Classes/Functions: `ContactMessageCreate`, `ContactMessageResponse`
- `backend/app/models/event.py`: Event schemas.
	- Classes/Functions: `EventBase`, `EventCreate`, `EventUpdate`, `EventResponse`
- `backend/app/models/member.py`: Member schemas and photo validators.
	- Classes/Functions: `MemberBase`, `MemberCreate`, `MemberUpdate`, `MemberResponse`, `normalize_photo_value`, `validate_photo_value`
- `backend/app/models/project.py`: Project and contributor schemas.
	- Classes/Functions: `ProjectBase`, `ProjectCreate`, `ProjectUpdate`, `ProjectResponse`, `ProjectContributorBase`, `ProjectContributorCreate`, `ProjectContributorResponse`
- `backend/app/models/timeline.py`: Timeline schemas.
	- Classes/Functions: `TimelineBase`, `TimelineCreate`, `TimelineUpdate`, `TimelineResponse`
- `backend/app/models/validators.py`: Shared model normalization helpers.
	- Classes/Functions: `normalize_text`, `normalize_empty_url`

### Backend Routers

- `backend/app/routers/admin_auth.py`: Backend-admin auth endpoints.
	- Classes/Functions: `login`, `get_session`, `logout`
- `backend/app/routers/announcements.py`: Public/admin announcement endpoints.
	- Classes/Functions: `_prepare_announcement_payload`, `list_announcements`, `list_announcements_admin`, `create_announcement`, `update_announcement`, `delete_announcement`
- `backend/app/routers/applications.py`: Application submit and admin review endpoints.
	- Classes/Functions: `create_application`, `list_applications`, `update_application_status`
- `backend/app/routers/contact_messages.py`: Contact submit and admin inbox endpoints.
	- Classes/Functions: `create_contact_message`, `list_contact_messages`
- `backend/app/routers/events.py`: Public/admin event endpoints.
	- Classes/Functions: `list_events`, `list_upcoming_events`, `list_events_admin`, `create_event`, `update_event`, `delete_event`
- `backend/app/routers/members.py`: Public/admin member endpoints.
	- Classes/Functions: `list_members`, `list_members_admin`, `create_member`, `update_member`, `delete_member`
- `backend/app/routers/projects.py`: Public/admin project endpoints.
	- Classes/Functions: `_serialize_projects`, `_replace_project_contributors`, `list_projects`, `list_featured_projects`, `list_projects_admin`, `create_project`, `update_project`, `delete_project`
- `backend/app/routers/timeline.py`: Public/admin timeline endpoints.
	- Classes/Functions: `list_timeline`, `list_timeline_admin`, `create_timeline_entry`, `update_timeline_entry`, `delete_timeline_entry`

### Frontend Infra

- `frontend/.dockerignore`: Frontend Docker ignore rules. Functions: none.
- `frontend/.env.example`: Frontend env template. Functions: none.
- `frontend/Dockerfile`: Frontend build + Nginx runtime image. Functions: none.
- `frontend/boneyard.config.json`: Boneyard capture config. Functions: none.
- `frontend/index.html`: SPA HTML shell. Functions: none.
- `frontend/nginx.conf`: SPA routing fallback config. Functions: none.
- `frontend/package-lock.json`: Frontend npm lockfile. Functions: none.
- `frontend/package.json`: Frontend scripts + dependencies. Functions: none.
- `frontend/postcss.config.js`: PostCSS plugins config. Functions: none.
- `frontend/tailwind.config.js`: Tailwind scan/theme config. Functions: none.
- `frontend/vite.config.js`: Vite config. Functions: none.

### Frontend Entry and Assets

- `frontend/src/main.jsx`: React bootstrap entry.
	- Classes/Functions: none (top-level mount)
- `frontend/src/App.jsx`: Main route tree and app layouts.
	- Classes/Functions: `PublicLayout`, `AdminLayout`, `AppRoutes`, `App`
- `frontend/src/index.css`: Global styles and design tokens. Functions: none.
- `frontend/src/assets/kp-logo.png`: Brand logo asset. Functions: none.

### Frontend Bones

- `frontend/src/bones/registry.js`: Boneyard registry setup. Functions: none.
- `frontend/src/bones/events-page.bones.json`: Events skeleton shape. Functions: none.
- `frontend/src/bones/home-hero.bones.json`: Home hero skeleton shape. Functions: none.
- `frontend/src/bones/home-projects-preview.bones.json`: Home projects skeleton shape. Functions: none.
- `frontend/src/bones/home-stats.bones.json`: Home stats skeleton shape. Functions: none.
- `frontend/src/bones/home-team-preview.bones.json`: Home team skeleton shape. Functions: none.
- `frontend/src/bones/home-timeline-announcements.bones.json`: Home timeline/announcement skeleton shape. Functions: none.
- `frontend/src/bones/projects-grid.bones.json`: Projects grid skeleton shape. Functions: none.
- `frontend/src/bones/team-grid.bones.json`: Team grid skeleton shape. Functions: none.

### Frontend Context, Hooks, Lib

- `frontend/src/context/AuthContext.jsx`: Auth provider and auth state sync.
	- Classes/Functions: `AuthProvider`, `useAuthContext`, `isAdminUser`, `clearAuthState`
- `frontend/src/context/ProximityContext.jsx`: Shared proximity container context.
	- Classes/Functions: `ProximityContainerProvider`, `useProximityContainer`
- `frontend/src/hooks/useAuth.js`: Hook wrapper over auth context.
	- Classes/Functions: `useAuth`
- `frontend/src/hooks/useAdminCrudPage.js`: Shared admin CRUD page state/handler hook.
	- Classes/Functions: `useAdminCrudPage`
- `frontend/src/hooks/useAdminForm.js`: Shared admin form state/change hook.
	- Classes/Functions: `useAdminForm`
- `frontend/src/hooks/useFetch.js`: Generic async data hook.
	- Classes/Functions: `useFetch`
- `frontend/src/lib/api.js`: Axios client and unauthorized handler plumbing.
	- Classes/Functions: `setUnauthorizedHandler`, `extractError`
- `frontend/src/lib/utils.js`: Shared frontend utilities.
	- Classes/Functions: `normalizeUrl`

### Frontend Services

- `frontend/src/services/createAdminCrudService.js`: Shared admin service factories.
	- Methods: `createAdminCrudService`, `createAdminListService`
- `frontend/src/services/adminAuthService.js`: Admin auth/session API service.
	- Methods: `getSession`, `login`, `logout`
- `frontend/src/services/announcementService.js`: Announcement API service.
	- Methods: `getPublished`, `getAdminAll`, `create`, `update`, `remove`
- `frontend/src/services/applicationService.js`: Application API service.
	- Methods: `submit`, `getAdminAll`, `updateStatus`
- `frontend/src/services/contactService.js`: Contact API service.
	- Methods: `submit`, `getAdminAll`
- `frontend/src/services/eventService.js`: Event API service.
	- Methods: `getAll`, `getUpcoming`, `getAdminAll`, `create`, `update`, `remove`
- `frontend/src/services/memberService.js`: Member API service.
	- Methods: `getAll`, `getAdminAll`, `create`, `update`, `remove`
- `frontend/src/services/projectService.js`: Project API service.
	- Methods: `getAll`, `getFeatured`, `getAdminAll`, `create`, `update`, `remove`
- `frontend/src/services/timelineService.js`: Timeline API service.
	- Methods: `getAll`, `getAdminAll`, `create`, `update`, `remove`

### Frontend Common Components

- `frontend/src/components/common/BoneyardFallbacks.jsx`: Loading fallback UI blocks.
	- Classes/Functions: `BoneBlock`, `StatsFallback`, `CardGridFallback`, `HomeHeroFallback`, `TimelineAnnouncementFallback`, `ProjectsPageFallback`, `TeamGridFallback`, `EventsPageFallback`, `TeamPageFallback`, `AdminLoginFallback`, `AdminDashboardFallback`, `AdminCrudPageFallback`, `AdminApplicationsFallback`, `AdminContactMessagesFallback`
- `frontend/src/components/common/ConfirmModal.jsx`: Confirm dialog.
	- Classes/Functions: `ConfirmModal`
- `frontend/src/components/common/ErrorMessage.jsx`: Error view with retry option.
	- Classes/Functions: `ErrorMessage`
- `frontend/src/components/common/Footer.jsx`: Site footer.
	- Classes/Functions: `Footer`
- `frontend/src/components/common/LoadingSpinner.jsx`: Spinner component.
	- Classes/Functions: `SpinnerView`, `LoadingSpinner`
- `frontend/src/components/common/Navbar.jsx`: Site navbar.
	- Classes/Functions: `Navbar`
- `frontend/src/components/common/Toast.jsx`: Toast messages.
	- Classes/Functions: `Toast`
- `frontend/src/components/common/VariableProximity.css`: Variable text effect styles. Functions: none.
- `frontend/src/components/common/VariableProximity.jsx`: Proximity-based variable text engine.
	- Classes/Functions: `calculateDistance`, `calculateFalloff`, `parseSettings`, `useAnimationFrame`, `useMousePositionRef`, `updatePosition`
- `frontend/src/components/common/VariableText.jsx`: Wrapper around VariableProximity.
	- Classes/Functions: `VariableText`

### Frontend Public Components

- `frontend/src/components/public/AnnouncementCard.jsx`: Announcement card UI.
	- Classes/Functions: `AnnouncementCard`
- `frontend/src/components/public/CircularGallery.css`: Circular gallery styles. Functions: none.
- `frontend/src/components/public/CircularGallery.jsx`: Circular media gallery.
	- Classes/Functions: `CircularGallery`, `createTextTexture`, `debounce`, `distance`, `lerp`, `fov`, `radius`, `autoBind`
- `frontend/src/components/public/EventCard.jsx`: Event card UI.
	- Classes/Functions: `EventCard`
- `frontend/src/components/public/HeroSection.jsx`: Homepage hero.
	- Classes/Functions: `HeroSection`
- `frontend/src/components/public/MemberCard.jsx`: Team member card.
	- Classes/Functions: `MemberCard`
- `frontend/src/components/public/ProjectCard.jsx`: Project card UI.
	- Classes/Functions: `ProjectCard`
- `frontend/src/components/public/StatsBar.jsx`: Stats strip.
	- Classes/Functions: `StatsBar`
- `frontend/src/components/public/TimelineItem.jsx`: Timeline item UI.
	- Classes/Functions: `TimelineItem`

### Frontend Admin Components

- `frontend/src/components/admin/AdminSidebar.jsx`: Admin sidebar.
	- Classes/Functions: `AdminSidebar`
- `frontend/src/components/admin/AnnouncementForm.jsx`: Announcement create/update form.
	- Classes/Functions: `AnnouncementForm`, `submit`
- `frontend/src/components/admin/EventForm.jsx`: Event create/update form.
	- Classes/Functions: `mapEventInitialData`, `EventForm`, `submit`
- `frontend/src/components/admin/MemberForm.jsx`: Member create/update form.
	- Classes/Functions: `MemberForm`, `handlePhotoUpload`, `clearPhoto`, `submit`
- `frontend/src/components/admin/ProjectForm.jsx`: Project create/update form with contributors.
	- Classes/Functions: `mapProjectInitialData`, `ProjectForm`, `addContributor`, `removeContributor`, `updateContributor`, `submit`
- `frontend/src/components/admin/TimelineForm.jsx`: Timeline create/update form.
	- Classes/Functions: `TimelineForm`, `submit`

### Frontend Public Pages

- `frontend/src/pages/public/ApplyPage.jsx`: Public application page.
	- Classes/Functions: `ApplyPage`, `handleChange`
- `frontend/src/pages/public/ContactPage.jsx`: Public contact page.
	- Classes/Functions: `ContactPage`, `TerminalPanel`, `ContactInfoCard`, `handleChange`
- `frontend/src/pages/public/EventsPage.jsx`: Public events page.
	- Classes/Functions: `EventsPage`, `refresh`, `handleVisibilityChange`
- `frontend/src/pages/public/HomePage.jsx`: Public home page.
	- Classes/Functions: `HomePage`, `isBoneyardBuildMode`
- `frontend/src/pages/public/NotFound.jsx`: SPA not-found page.
	- Classes/Functions: `NotFound`
- `frontend/src/pages/public/ProjectsPage.jsx`: Public projects page.
	- Classes/Functions: `ProjectsPage`
- `frontend/src/pages/public/TeamPage.jsx`: Public team page.
	- Classes/Functions: `TeamPage`, `isValidImageSource`

### Frontend Admin Pages

- `frontend/src/pages/admin/AdminDashboard.jsx`: Admin dashboard with summary metrics.
	- Classes/Functions: `AdminDashboard`
- `frontend/src/pages/admin/AdminLoginPage.jsx`: Admin sign-in page.
	- Classes/Functions: `AdminLoginPage`, `validate`, `syncAutofillState`, `syncNow`, `handleBlur`, `handleChange`, `handleVisibility`
- `frontend/src/pages/admin/ManageAnnouncements.jsx`: Admin announcement management.
	- Classes/Functions: `ManageAnnouncements`
- `frontend/src/pages/admin/ManageEvents.jsx`: Admin event management.
	- Classes/Functions: `ManageEvents`, `getRequestErrorMessage`
- `frontend/src/pages/admin/ManageMembers.jsx`: Admin member management.
	- Classes/Functions: `ManageMembers`, `getRequestErrorMessage`
- `frontend/src/pages/admin/ManageProjects.jsx`: Admin project management.
	- Classes/Functions: `ManageProjects`
- `frontend/src/pages/admin/ManageTimeline.jsx`: Admin timeline management.
	- Classes/Functions: `ManageTimeline`
- `frontend/src/pages/admin/ViewApplications.jsx`: Admin application review page.
	- Classes/Functions: `ViewApplications`
- `frontend/src/pages/admin/ViewContactMessages.jsx`: Admin contact inbox page.
	- Classes/Functions: `ViewContactMessages`, `formatDate`

### Frontend Routing

- `frontend/src/router/ProtectedRoute.jsx`: Route guard for admin pages.
	- Classes/Functions: `ProtectedRoute`

## Verification Notes

- Inventory aligned to committed files only (`git ls-files`).
- Deleted/untracked files are intentionally not documented here.
- If new files are added, update this README section in the same commit.
