import logging
import os
import urllib.request
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.model import ModelLoadError, load_model, predict
from app.validation import sniff_image_format

logger = logging.getLogger("shuaa.inference")
logging.basicConfig(level=logging.INFO)

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
RATE_LIMIT = os.environ.get("PREDICT_RATE_LIMIT", "30/minute")

limiter = Limiter(key_func=get_remote_address)


def _ensure_model_file(model_path: str) -> None:
    """Fetch the checkpoint from MODEL_URL if it isn't already on disk.

    Used on serverless deployments (Vercel) where the 512MB checkpoint
    can't be bundled with the code — it's fetched once from Vercel Blob
    storage into a writable path and reused for the life of the warm
    instance. No-op for local/Render, where MODEL_PATH already points at
    a real file and MODEL_URL is unset.
    """
    if not model_path or os.path.isfile(model_path):
        return
    model_url = os.environ.get("MODEL_URL")
    if not model_url:
        return  # load_model() will raise its own clear "not found" error
    logger.info("Fetching model checkpoint from MODEL_URL ...")
    os.makedirs(os.path.dirname(model_path) or ".", exist_ok=True)
    urllib.request.urlretrieve(model_url, model_path)
    logger.info("Model checkpoint fetched to %s", model_path)


def _load_model_state(app: FastAPI) -> None:
    model_path = os.environ.get("MODEL_PATH", "")
    _ensure_model_file(model_path)
    app.state.model = load_model(model_path)
    logger.info("Model loaded from %s", model_path)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model at startup, but NEVER re-raise here: raising inside
    # lifespan tears down the ASGI app before it binds to a port, so the
    # platform shows a dead-container error instead of a running service.
    # On failure we leave app.state.model = None and let get_model()'s lazy
    # path retry on the first real request. The service still fails loudly —
    # /predict returns 503 and /health reports degraded — it just does so
    # per-request instead of by refusing to boot. There is still no silent
    # heuristic fallback: a request is never answered without a real model.
    try:
        _load_model_state(app)
    except ModelLoadError:
        logger.exception("Model failed to load at startup — will retry lazily on first request")
        app.state.model = None
    yield


app = FastAPI(title="Shu'a' Inference Service", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def get_model(request: Request):
    """Return the loaded model, loading it lazily if startup didn't."""
    model = getattr(request.app.state, "model", None)
    if model is not None:
        return model
    _load_model_state(request.app)
    return request.app.state.model


@app.get("/health")
def health(request: Request):
    try:
        get_model(request)
        loaded = True
    except Exception:
        loaded = False
    return {"status": "ok" if loaded else "degraded", "model_loaded": loaded}


@app.post("/predict")
@limiter.limit(RATE_LIMIT)
async def predict_route(request: Request, file: UploadFile = File(...)):
    # Bounded read: never buffer more than the limit regardless of what
    # the Content-Length header claims.
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    await file.close()

    if not data:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 10MB limit")
    if sniff_image_format(data) is None:
        raise HTTPException(
            status_code=400,
            detail="File is not a valid JPEG or PNG (checked by content, not extension)",
        )

    try:
        model = get_model(request)
    except ModelLoadError as exc:
        logger.exception("Model unavailable")
        raise HTTPException(status_code=503, detail=f"Model unavailable: {exc}") from None

    try:
        return predict(model, data)
    except Exception:
        logger.exception("Inference failed")
        raise HTTPException(status_code=500, detail="Inference failed") from None
