require('dotenv').config();

const mongoose = require('mongoose');
const createApp = require('./app');

const PORT = Number(process.env.PORT) || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function main() {
  if (!MONGO_URI) {
    console.error('MONGO_URI env var is required (see .env.example)');
    process.exit(1);
  }
  if (!process.env.INFERENCE_SERVICE_URL) {
    console.error('INFERENCE_SERVICE_URL env var is required (see .env.example)');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const app = createApp();
  app.listen(PORT, () => console.log(`Shu'a' backend listening on :${PORT}`));
}

main().catch((err) => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
