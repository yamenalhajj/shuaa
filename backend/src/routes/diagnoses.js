const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const Diagnosis = require('../models/Diagnosis');
const { classifyImage } = require('../services/inference');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png)$/.test(file.mimetype)) return cb(null, true);
    cb(Object.assign(new Error('Only JPEG or PNG images are accepted'), { status: 400 }));
  },
});

const diagnoseLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.DIAGNOSE_RATE_LIMIT) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many diagnosis requests, try again shortly' },
});

// Declared MIME types lie; check the real file signature before the bytes
// go anywhere near an image decoder.
function isRealImage(buffer) {
  const isJpeg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng = buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return isJpeg || isPng;
}

// The client-supplied filename is untrusted: strip any path components and
// anything outside a safe charset before it is stored or echoed back.
function sanitizeFilename(name) {
  const base = String(name || 'upload').split(/[\\/]/).pop();
  const clean = base.replace(/[^\w.\- ]/g, '_').slice(0, 200);
  return clean || 'upload';
}

// Explicit field list so a future schema change can't silently leak or
// drop fields — everything saved to Mongo is returned to the caller.
function serialize(doc) {
  return {
    id: doc._id,
    imageFilename: doc.imageFilename,
    label: doc.label,
    labelAr: doc.labelAr,
    confidence: doc.confidence,
    probabilities: {
      NORMAL: doc.probabilities.NORMAL,
      PNEUMONIA: doc.probabilities.PNEUMONIA,
    },
    modelVersion: doc.modelVersion,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

router.post('/diagnose', diagnoseLimiter, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ error: 'Missing image — send a JPEG/PNG as multipart field "image"' });
    }
    if (!isRealImage(req.file.buffer)) {
      return res.status(400).json({ error: 'File content is not a valid JPEG or PNG' });
    }

    const result = await classifyImage(req.file.buffer, req.file.mimetype);

    const doc = await Diagnosis.create({
      imageFilename: sanitizeFilename(req.file.originalname),
      ...result,
    });

    res.status(201).json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

router.get('/diagnoses', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const [items, total] = await Promise.all([
      Diagnosis.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Diagnosis.countDocuments(),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map(serialize),
    });
  } catch (err) {
    next(err);
  }
});

// Supports the frontend's "Clear history" action. Demo tool with no user
// accounts, so clearing is global by design.
router.delete('/diagnoses', async (req, res, next) => {
  try {
    const { deletedCount } = await Diagnosis.deleteMany({});
    res.json({ deleted: deletedCount });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
