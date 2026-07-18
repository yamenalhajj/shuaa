# Shu'a' — Frontend

Vite + React port of the Claude Design prototype ("Shua Screening.dc.html"),
wired to the real backend. Bilingual (Arabic RTL / English LTR), five
screens: upload, analyzing, result, error, history.

## Run locally

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev        # http://localhost:3000
```

Requires the backend on port 4000 and the inference service on port 8001
(see ../backend/README.md and ../inference-service/README.md). The dev
server pins port 3000 because that is the origin in the backend's CORS
allowlist (`ALLOWED_ORIGINS`).

## Configuration

| Variable | Purpose |
|---|---|
| `VITE_API_BASE` | Backend API base URL (default `http://localhost:4000/api`) — the single place the API address lives. |

## How it maps to the design

- Every screen, animation (scan-line sweep, count-up reveal, shimmer,
  verdict glow), design token, and the bilingual dictionary are ported
  verbatim from the prototype — this was a data-wiring job, not a redesign.
- Mock/scripted results were replaced with real calls:
  `POST /api/diagnose` (upload) and `GET /api/diagnoses` (history).
- The backend is the source of truth for history. localStorage keeps only
  (a) a fallback cache served when the backend is unreachable and
  (b) image thumbnails, since the backend deliberately stores no images.
- Errors show the backend's actual message (400/413/502/500) or a
  network-unreachable state; the footer demo buttons still preview the
  designed error states.
- "VGG16 · 224×224" in the image overlay describes the model's input size,
  as designed.
