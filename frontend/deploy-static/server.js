// Minimal static file server for the built SPA on Azure App Service.
// Serves dist/ and falls back to index.html so client-side routing works.
const express = require('express');
const path = require('path');

const app = express();
const dist = path.join(__dirname, 'dist');

app.use(express.static(dist));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Shu'a' frontend static server on :${port}`));
