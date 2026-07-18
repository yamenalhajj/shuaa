// Single place the backend base URL is configured (VITE_API_BASE in .env)
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 = network failure (backend unreachable)
  }
}

async function parseError(response) {
  const body = await response.json().catch(() => ({}));
  return new ApiError(body.error || `Request failed (HTTP ${response.status})`, response.status);
}

export async function diagnose(file, signal) {
  const form = new FormData();
  form.append('image', file, file.name || 'upload.jpg');

  let response;
  try {
    response = await fetch(`${API_BASE}/diagnose`, { method: 'POST', body: form, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Backend unreachable', 0);
  }
  if (!response.ok) throw await parseError(response);
  return response.json();
}

export async function fetchDiagnoses(limit = 12) {
  let response;
  try {
    response = await fetch(`${API_BASE}/diagnoses?page=1&limit=${limit}`);
  } catch {
    throw new ApiError('Backend unreachable', 0);
  }
  if (!response.ok) throw await parseError(response);
  const body = await response.json();
  return Array.isArray(body.items) ? body.items : [];
}

export async function clearDiagnoses() {
  let response;
  try {
    response = await fetch(`${API_BASE}/diagnoses`, { method: 'DELETE' });
  } catch {
    throw new ApiError('Backend unreachable', 0);
  }
  if (!response.ok) throw await parseError(response);
}
