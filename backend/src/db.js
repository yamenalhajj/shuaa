const mongoose = require('mongoose');

// Memoized so the connection is established once per process and reused.
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
