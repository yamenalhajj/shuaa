import logging
import os
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail loudly at startup: a broken model must never serve traffic.
    model_path = os.environ.get("MODEL_PATH", "")
    try:
        app.state.model = load_model(model_path)
    except ModelLoadError:
        logger.exception("Model failed to load — service cannot start")
        raise
    logger.info("Model loaded from %s", model_path)
    yield


app = FastAPI(title="Shu'a' Inference Service", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/health")
def health(request: Request):
    loaded = getattr(request.app.state, "model", None) is not None
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
        return predict(request.app.state.model, data)
    except Exception:
        logger.exception("Inference failed")
        raise HTTPException(status_code=500, detail="Inference failed") from None
