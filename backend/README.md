# Shu'a' — Backend API

Express + MongoDB service: accepts chest X-ray uploads, forwards them to
the inference service, stores every result, and serves the history.

## Run locally

```powershell
cd backend
npm install
copy .env.example .env    # then edit values
npm start
```

Requires MongoDB running and the inference service up at
`INFERENCE_SERVICE_URL` (see ../inference-service/README.md).

## Endpoints

- `POST /api/diagnose` — multipart field `image` (JPEG/PNG, max 10MB).
  Returns the full saved record:
  `{id, imageFilename, label, labelAr, confidence, probabilities, modelVersion, createdAt, updatedAt}`.
  Errors: `400` bad/missing file, `413` too large, `429` rate-limited,
  `502` inference service down, `500` unexpected — always with a JSON `error` message.
- `GET /api/diagnoses?page=1&limit=10` — history, most recent first
  (limit capped at 50).
- `DELETE /api/diagnoses` — clears all history (backs the frontend's
  "Clear history" button; global because the demo has no user accounts).
- `GET /health` — liveness.

## Environment variables (all required before public deployment)

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default 4000) |
| `MONGO_URI` | MongoDB connection string — env only, never hardcoded |
| `INFERENCE_SERVICE_URL` | Base URL of the FastAPI inference service |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist — set to your real frontend origin, never `*` |
| `DIAGNOSE_RATE_LIMIT` | Per-IP requests/minute on `/api/diagnose` (default 20) |

## Security notes

- Uploads are validated by **magic bytes**, not the declared MIME type.
- Client filenames are sanitized (path components stripped) before storage.
- `helmet` security headers, explicit CORS allowlist, per-IP rate limiting,
  framework-level body/file size limits.
- `.env` is gitignored; no secrets belong in any committed file.
