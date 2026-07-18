# Shu'a' (شعاع)

Bilingual (Arabic/English) chest X-ray pneumonia screening tool — AI Expo
Jordan 2026, Healthcare track.

## Components

- [frontend/](frontend/) — Vite + React single-page app, RTL/LTR bilingual UI
- [backend/](backend/) — Express + MongoDB API; validates uploads, calls the
  inference service, and stores per-session diagnosis history
- [inference-service/](inference-service/) — FastAPI + PyTorch VGG16
  classifier (NORMAL / PNEUMONIA)

Each folder has its own README with local-run instructions and required
environment variables.

## Architecture

```
browser ──> frontend ──> backend ──> inference service ──> VGG16
                            │
                            └──> MongoDB (diagnosis history)
```

History is scoped to an anonymous per-browser session id (`X-Session-Id`);
there are no user accounts and results are never shared across visitors.

## Model checkpoint

The fine-tuned `vgg16.pth` (~512 MB) is not committed (gitignored). It is
hosted in object storage and fetched at startup via the `MODEL_URL`
environment variable; for local runs, point `MODEL_PATH` at a local copy.

## Deployment

Deployed on Azure App Service (Linux): the frontend and backend as Node
apps, the inference service as a Python app. Configuration is supplied
entirely through environment variables (see each folder's README). A
[render.yaml](render.yaml) Blueprint is included as an alternative host.

## Known limitation

Honest test accuracy is ~80% (validation ~98%) due to a val→test domain
shift. This is documented deliberately — Shu'a' is a screening-support
demo, not a diagnostic device. See
[inference-service/README.md](inference-service/README.md) for the metrics
and the decision-threshold rationale.
