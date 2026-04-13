# Kamand Prompt Dev Cell - Internal Hackathon

The official site for Kamand Prompt, IIT Mandi's programming club. Public side for visitors, protected admin portal for whoever is running the club that semester.

## What's in here

Public:
- Homepage, projects, team, events 
- Apply and contact forms, both wired to the backend

Admin:
- Login with session cookies 
- Dashboard, plus CRUD for members, projects, events, and announcements
- Application review - mark submissions pending, accepted, or rejected
- Contact message inbox

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + backend session cookie |
| Containers | Docker + Docker Compose |

## Running it locally

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Put your Supabase URL, anon key, and JWT secret into backend/.env. Frontend needs the API base URL and Supabase config.

```bash
docker compose up --build
```

- Frontend -> http://localhost:3000
- Backend -> http://localhost:8000
- API docs -> http://localhost:8000/docs

## API

FastAPI generates interactive docs at /docs. Every endpoint shows its expected request shape and lets you fire live requests from the browser. Broken requests come back as structured JSON, not a crash.

## Security

Admin routes are protected at the backend. Session state lives in a cookie, not in localStorage. Supabase RLS handles database-level access control independently of the API layer.

## Repo layout

```text
frontend/src/
	assets/
	bones/
	components/
		admin/
		common/
		public/
	context/
	hooks/
	lib/
	pages/
		admin/
		public/
	router/
	services/
backend/app/
	db/
	exceptions/
	middleware/
	models/
	routers/
```
