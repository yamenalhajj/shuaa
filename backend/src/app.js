const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const diagnosesRouter = require('./routes/diagnoses');
const errorHandler = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      // Explicit allowlist — never "*". Comma-separated env var so a
      // deployed frontend origin can be added without a code change.
      origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
    })
  );
  // JSON bodies are tiny here (uploads go through multer's own 10MB cap);
  // keep the framework-level limit small so junk payloads die early.
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api', diagnosesRouter);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
