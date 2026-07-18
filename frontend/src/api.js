// Single place the backend base URL is configured (VITE_API_BASE in .env)
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api';

// Random anonymous token that scopes history to this browser (no accounts).
// Persisted in localStorage and sent as X-Session-Id on every request.
const SESSION_KEY = 'shua.sessionId.v1';

function getSessionId() {
  let id = null;
  try {
    id = localStorage.getItem(SESSION_KEY);
  } catch {
    // storage blocked — fall through and use an in-memory id for this load
  }
  if (!id || !/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      // best-effort; the id still works for this page load
    }
  }
  return id;
}

function sessionHeaders() {
  return { 'X-Session-Id': getSessionId() };
}

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
    response = await fetch(`${API_BASE}/diagnose`, {
      method: 'POST',
      body: form,
      headers: sessionHeaders(),
      signal,
    });
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
    response = await fetch(`${API_BASE}/diagnoses?page=1&limit=${limit}`, {
      headers: sessionHeaders(),
    });
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
    response = await fetch(`${API_BASE}/diagnoses`, {
      method: 'DELETE',
      headers: sessionHeaders(),
    });
  } catch {
    throw new ApiError('Backend unreachable', 0);
  }
  if (!response.ok) throw await parseError(response);
}
