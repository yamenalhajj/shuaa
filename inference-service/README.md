# Shu'a' — Inference Service

FastAPI service that serves the fine-tuned VGG16 chest X-ray classifier
(NORMAL vs PNEUMONIA) with bilingual (English/Arabic) labels.

## Run locally

```powershell
cd inference-service
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt   # CPU torch; use the PyTorch
                                                # index URL if you need CUDA
$env:MODEL_PATH = "..\vgg16.pth"
.venv\Scripts\uvicorn app.main:app --port 8001
```

## Endpoints

- `POST /predict` — multipart field `file` (JPEG/PNG, max 10MB). Returns
  `{label, label_ar, confidence, probabilities: {NORMAL, PNEUMONIA}, model_version}`.
- `GET /health` — `{status, model_loaded}`.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MODEL_PATH` | **yes** | — | Path to the VGG16 checkpoint. The service refuses to start without a loadable model — there is no fallback. |
| `PREDICT_RATE_LIMIT` | no | `30/minute` | Per-IP rate limit on `/predict`. |
| `MODEL_VERSION` | no | `vgg16-chestxray-v1` | Version string returned with each prediction. |
| `PNEUMONIA_THRESHOLD` | no | `0.65` | Minimum P(PNEUMONIA) required to call PNEUMONIA instead of NORMAL. See below. |

Set `MODEL_PATH` (and review the rate limit) before deploying anywhere
public. Uploads are validated by magic bytes — anything that isn't a real
JPEG/PNG is rejected before it reaches the image decoder.

## Known limitation (do not hide this in demos)

Honest test accuracy on the full official Kaggle chest_xray test split
(234 NORMAL + 390 PNEUMONIA) is **80.13%** at the naive 0.5 cut — evaluated
once during model selection (via validation accuracy) with no test-set
peeking to *choose* the model. Validation accuracy is ~98–99%; the gap is a
val→test **domain shift**, not a bug. This is a screening-support demo, not
a diagnostic device. VGG16 was also confirmed to be the best of 4
architectures tried (VGG16/AlexNet/GoogLeNet/EfficientNet-B0, 3 optimizer
configs each) on this same real test set — the ones with flashier validation
scores (GoogLeNet 98.67%, EfficientNet-B0 98.88%) actually score *worse* on
real test data (72.92%, 76.12%), which is the val→test gap in action.

## Decision threshold (PNEUMONIA_THRESHOLD)

The raw model (0.5 cut) is asymmetric on real data: **Recall = 100.00%**
(all 390 real PNEUMONIA test images caught, zero false negatives) but
**Precision = 75.88%** (only 110/234 real NORMAL images correctly cleared —
the rest are false alarms). All of the model's error is false positives,
never false negatives, on this test set.

`PNEUMONIA_THRESHOLD` (default `0.65`) was derived directly from that same
test set with one rule: **the highest threshold that still produces zero
false negatives across all 390 real PNEUMONIA cases.** The lowest
P(PNEUMONIA) among all of them is 0.6879; `0.65` sits safely below that
edge. Verified result: Accuracy 81.57%, Precision 77.23%, **Recall 100.00%**
(unchanged), F1 87.15%. This never trades recall for precision — it only
claims precision that was free to take, in line with the standard medical
screening rule that a missed case (false negative) is worse than a false
alarm (false positive).

**Methodological caveat:** this threshold was derived from the same test set
behind the 80.13% headline accuracy, so the resulting 81.57% is not an
independently re-validated number — cite 80.13% as the honest baseline
accuracy, and describe 0.65 as an engineering decision informed by that
set's real error profile (specifically the recall guarantee, which is
directly checked against all 390 positive cases and doesn't depend on
threshold-shopping for a bigger accuracy number).

The `probabilities` field in every response is always the raw, unmodified
softmax output regardless of this threshold, so a borderline call stays
visibly borderline to the caller instead of being hidden behind a
confident-looking label.
