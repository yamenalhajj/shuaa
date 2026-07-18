// Thin client for the FastAPI inference service. Any failure here is
// surfaced to the route as an error with `status: 502` — the backend has
// no way to classify an X-ray on its own and must never pretend to.

const INFERENCE_URL = process.env.INFERENCE_SERVICE_URL;

class InferenceError extends Error {
  constructor(message) {
    super(message);
    this.status = 502;
  }
}

async function classifyImage(buffer, mimetype) {
  if (!INFERENCE_URL) {
    throw new InferenceError('INFERENCE_SERVICE_URL is not configured');
  }

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), 'upload');

  let response;
  try {
    response = await fetch(`${INFERENCE_URL}/predict`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    throw new InferenceError(`Inference service unreachable: ${err.message}`);
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new InferenceError(
      `Inference service returned ${response.status}: ${body.detail || 'no detail'}`
    );
  }

  const { label, label_ar, confidence, probabilities, model_version } = body;
  if (!label || !label_ar || typeof confidence !== 'number' || !probabilities) {
    throw new InferenceError('Inference service returned an incomplete result');
  }

  return {
    label,
    labelAr: label_ar,
    confidence,
    probabilities,
    modelVersion: model_version || 'unknown',
  };
}

module.exports = { classifyImage, InferenceError };
