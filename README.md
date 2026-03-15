# VoiceIDO

Pipeline app for **OCR**, **Analyze**, **Transcribe**, and **Video** (summaries). Next.js frontend, Express backend, optional deploy to Google Compute Engine with zero-cost VM control (go-online / go-offline).

## Stack

- **Frontend:** Next.js 14, React, Tailwind
- **Backend:** Node.js, Express, TypeScript; OpenRouter, Google Cloud Vision & Speech
- **Run:** Docker Compose (nginx → frontend + `/api` → backend)

## Quick start (local)

```bash
# Backend
cp backend/.env.example backend/.env   # or create backend/.env with OPENROUTER_API_KEY, etc.
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). API at `http://localhost:4000` (or set `NEXT_PUBLIC_API_URL`).

## Run with Docker

From repo root (with `backend/.env` and optional `gcp-key.json` in place):

```bash
docker compose up -d --build
```

App at **http://localhost:80**.

## Deploy to GCP (zero-cost friendly)

One script: **setup-secrets**, **full** (first-time VM + app), **online** (start VM + app), **offline** (stop VM to save cost). Optional GitHub Actions for scheduled go-online / go-offline.

See **[deploy/README.md](deploy/README.md)** for:

- Storing keys in Secret Manager
- First-time deploy (`./deploy/deploy.sh full`)
- Daily go-online / go-offline
- GitHub Actions setup

## Repo layout

- `backend/` — Express API (OCR, analyze, transcribe, video)
- `frontend/` — Next.js app
- `deploy/` — Single deploy script + [deploy/README.md](deploy/README.md)
- `nginx.conf`, `docker-compose.yml` — Single-host run

## License

Private / use as needed.
