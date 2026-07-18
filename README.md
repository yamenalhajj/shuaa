# Shu'a' (شعاع)

Bilingual chest X-ray pneumonia detector — AI Expo Jordan 2026, Healthcare track.

- [inference-service/](inference-service/) — FastAPI + PyTorch VGG16 classifier (NORMAL / PNEUMONIA)
- [backend/](backend/) — Express + MongoDB API that fronts the inference service and stores diagnosis history

Each folder has its own README with run instructions and required env vars.

**Model checkpoint:** place the fine-tuned `vgg16.pth` in the repo root (it is
gitignored — distribute it out-of-band, not through git).

**Known limitation:** honest test accuracy is ~80% (val ~98%) due to a
val→test domain shift. This is documented deliberately — Shu'a' is a
screening-support demo, not a diagnostic device.
