const mongoose = require('mongoose');

// Cached across warm serverless invocations (and a no-op after the first
// connect locally) — a request never pays the connect cost more than once
// per process.
let connectPromise = null;

function connectDb() {
  if (!connectPromise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      return Promise.reject(new Error('MONGO_URI env var is required (see .env.example)'));
    }
    connectPromise = mongoose.connect(uri);
  }
  return connectPromise;
}

module.exports = { connectDb };
