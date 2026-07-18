const multer = require('multer');

// Single funnel for every route error: multer limits → 400/413,
// inference failures → 502 (err.status), anything else → 500.
// Internals are logged server-side, never echoed to the client.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ error: `Upload rejected: ${err.message}` });
  }

  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.status === 502) {
    console.error('[inference]', err.message);
    return res.status(502).json({ error: err.message });
  }

  console.error('[unexpected]', err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
