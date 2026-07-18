// localStorage is a fallback cache and a thumbnail store only — the backend
// is the source of truth for history. The cache is served solely when the
// backend is unreachable, never merged with live data.
const HISTORY_KEY = 'shua.history.cache.v1';
const THUMBS_KEY = 'shua.thumbs.v1';
const MAX_THUMBS = 24;

export function loadCachedHistory() {
  try {
    const v = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function cacheHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 12)));
  } catch {
    // storage full/blocked — cache is best-effort
  }
}

export function loadThumbs() {
  try {
    const v = JSON.parse(localStorage.getItem(THUMBS_KEY) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function saveThumb(id, dataUrl) {
  const thumbs = loadThumbs();
  thumbs[id] = dataUrl;
  const ids = Object.keys(thumbs);
  for (const stale of ids.slice(0, Math.max(0, ids.length - MAX_THUMBS))) {
    delete thumbs[stale];
  }
  try {
    localStorage.setItem(THUMBS_KEY, JSON.stringify(thumbs));
  } catch {
    // best-effort
  }
  return thumbs;
}

export function clearLocal() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(THUMBS_KEY);
  } catch {
    // best-effort
  }
}

// Downscale the uploaded image to a small JPEG for the history thumbnails
// (same 480px / quality 0.7 approach as the design prototype).
export function makeThumb(src) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 480 / Math.max(im.width, im.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(im.width * k);
      cv.height = Math.round(im.height * k);
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/jpeg', 0.7));
    };
    im.onerror = () => resolve(src);
    im.src = src;
  });
}
