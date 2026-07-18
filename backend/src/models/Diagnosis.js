const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema(
  {
    // Anonymous per-browser id; history is scoped to it so results don't
    // leak across visitors. Indexed since every list query filters on it.
    sessionId: { type: String, required: true, index: true },
    imageFilename: { type: String, required: true },
    label: { type: String, required: true, enum: ['NORMAL', 'PNEUMONIA'] },
    labelAr: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    probabilities: {
      NORMAL: { type: Number, required: true, min: 0, max: 1 },
      PNEUMONIA: { type: Number, required: true, min: 0, max: 1 },
    },
    modelVersion: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
