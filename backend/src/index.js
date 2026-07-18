require('dotenv').config();

const createApp = require('./app');
const { connectDb } = require('./db');

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI env var is required (see .env.example)');
    process.exit(1);
  }
  if (!process.env.INFERENCE_SERVICE_URL) {
    console.error('INFERENCE_SERVICE_URL env var is required (see .env.example)');
    process.exit(1);
  }

  // Fail fast locally if Mongo isn't reachable, rather than waiting for
  // the first request to discover it.
  await connectDb();
  const app = createApp();
  app.listen(PORT, () => console.log(`Shu'a' backend listening on :${PORT}`));
}

main().catch((err) => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
