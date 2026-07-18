// Vercel entrypoint — Vercel's Node framework detection looks for a file
// that imports Express and exports the app instance (no vercel.json
// rewrites needed; see inference-service's separate Python deployment for
// the ML side, which cannot run on Vercel Functions).
require('dotenv').config();
const express = require('express'); // eslint-disable-line no-unused-vars
const createApp = require('./src/app');

module.exports = createApp();
