# Shu'a' (شعاع) — Requirements Specification

Bilingual (Arabic/English) chest X-ray pneumonia **screening** tool.
AI Expo Jordan 2026 — Healthcare track.

> Shu'a' is a screening-support demo, **not** a diagnostic device. It does
> not replace assessment by a qualified radiologist or physician.

---

## 1. Purpose & Scope

Shu'a' lets a user upload a chest X-ray image and receive a fast,
first-pass estimate of whether it appears **NORMAL** or shows signs of
**PNEUMONIA**, with a confidence score, in Arabic or English. It is a
binary classifier only; it does not detect other conditions.

---

## 2. Functional Requirements

| # | Requirement |
|---|---|
| F1 | Upload a chest X-ray via file picker or drag-and-drop. |
| F2 | Offer a built-in sample image so the tool can be tried without a file. |
| F3 | Accept only JPEG or PNG, validated by actual file content (magic bytes), not just the file extension. |
| F4 | Reject files larger than 10 MB. |
| F5 | Classify the image as NORMAL or PNEUMONIA using the fine-tuned VGG16 model. |
| F6 | Return the verdict, a confidence percentage, and the probability of each class. |
| F7 | Show the model's raw probabilities even for borderline cases (no hidden rounding of an uncertain result). |
| F8 | Display results bilingually — Arabic (سليمة / التهاب رئوي) and English (Normal / Pneumonia) — with a language toggle and correct RTL/LTR layout. |
| F9 | Show a clear, animated "analyzing" state while a request is in flight. |
| F10 | Persist each diagnosis and show a per-user history list, most recent first, paginated. |
| F11 | Let the user clear their own history. |
| F12 | Isolate history per browser session — a user only ever sees their own scans (no shared/global history). |
| F13 | Display a limitations/disclaimer notice on the result screen. |
| F14 | Show clear error states: invalid file, service unavailable, network failure — with the actual reason, not a generic message. |

---

## 3. Non-Functional Requirements

### 3.1 Security
| # | Requirement |
|---|---|
| S1 | Validate uploads by magic bytes before any image decoding. |
| S2 | Enforce request/file size limits at the framework level, not only in application code. |
| S3 | Rate-limit the inference and diagnosis endpoints to prevent abuse. |
| S4 | Set HTTP security headers (helmet) and restrict CORS to an explicit allowlist of origins — never `*`. |
| S5 | Sanitize the uploaded filename (no path traversal, no unsafe characters) before storage. |
| S6 | Load all secrets (database URI, model path/URL) from environment variables only — never hardcoded, never committed. |
| S7 | Scope diagnosis history to an anonymous per-browser session token; require it on every API route. |

### 3.2 Privacy
| # | Requirement |
|---|---|
| P1 | No user accounts and no personal data collected. |
| P2 | Identity is a random, non-guessable per-browser token only. |
| P3 | Results are never exposed across visitors. |

### 3.3 Reliability & Error Handling
| # | Requirement |
|---|---|
| R1 | Consistent error handling on every route; no unhandled crash of the process. |
| R2 | The inference service must fail loudly (clear error) if the model cannot load — no silent or heuristic fallback result. |
| R3 | Backend returns meaningful status codes: `400` bad input, `413` too large, `429` rate-limited, `502` inference unreachable, `500` unexpected. |

### 3.4 Model Quality & Honesty
| # | Requirement |
|---|---|
| M1 | Report honest held-out test accuracy (~80%), not the optimistic validation figure (~98%). |
| M2 | Document the val→test domain-shift gap as a known limitation rather than hiding it. |
| M3 | Use a decision threshold tuned so the model never misses a real pneumonia case on the test set (recall = 100%), reflecting that a missed case is worse than a false alarm. |
| M4 | Present the tool as a screening aid, not a diagnosis. |

### 3.5 Usability & Accessibility
| # | Requirement |
|---|---|
| U1 | Full bilingual UI with correct text direction (RTL for Arabic, LTR for English). |
| U2 | Arabic numerals shown in the Arabic locale. |
| U3 | Responsive layout; respects reduced-motion preferences. |

---

## 4. Technical / System Requirements

### 4.1 Runtime & Tooling
- **Node.js** ≥ 18 (frontend build + backend)
- **Python** 3.12 (inference service)
- **MongoDB** (local instance for development, MongoDB Atlas for production)
- Fine-tuned **VGG16 checkpoint** (`vgg16.pth`, ~512 MB), supplied out-of-band

### 4.2 Key Dependencies
- Frontend: React, Vite
- Backend: Express, Mongoose, Multer, Helmet, CORS, express-rate-limit
- Inference: FastAPI, Uvicorn, PyTorch (CPU), Torchvision, Pillow, SlowAPI

### 4.3 Required Environment Variables
| Service | Variable | Purpose |
|---|---|---|
| Inference | `MODEL_PATH` | Local path the checkpoint is loaded from |
| Inference | `MODEL_URL` | Object-storage URL to fetch the checkpoint if absent |
| Inference | `PNEUMONIA_THRESHOLD` | Decision threshold (default 0.65) |
| Inference | `PREDICT_RATE_LIMIT` | Per-IP rate limit |
| Backend | `MONGO_URI` | MongoDB connection string |
| Backend | `INFERENCE_SERVICE_URL` | Base URL of the inference service |
| Backend | `ALLOWED_ORIGINS` | Comma-separated CORS allowlist |
| Backend | `DIAGNOSE_RATE_LIMIT` | Per-IP diagnosis rate limit |
| Frontend | `VITE_API_BASE` | Backend API base URL |

### 4.4 External Services (production)
- Cloud host for the three services (deployed on **Azure App Service**, Linux)
- **MongoDB Atlas** cluster for the database
- Object storage hosting the model checkpoint

### 4.5 Model Input Contract
- Preprocessing: resize to 224×224, `ToTensor`, ImageNet normalization
  (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`)
- Classes (alphabetical): `["NORMAL", "PNEUMONIA"]`

---

## 5. Constraints & Assumptions

- Binary classifier only (NORMAL vs PNEUMONIA); other pathologies are out of scope.
- Input is assumed to be a chest X-ray; the tool does not verify anatomy.
- The model is used as-is; retraining is out of scope (the domain-shift gap is documented, not "fixed").
- Intended for demonstration/screening support, not clinical deployment.
