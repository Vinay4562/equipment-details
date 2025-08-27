import multer from 'multer';
import path from 'path';

// Always use in-memory storage to avoid ephemeral disk issues in serverless and ensure
// we can embed images as data URLs for persistence.
const storage = multer.memoryStorage();

const allowedExt = new Set(['.jpg', '.jpeg', '.png']);
const allowedMime = new Set(['image/jpeg', 'image/png']);

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeOk = allowedMime.has(file.mimetype);
  const extOk = allowedExt.has(ext);
  if (mimeOk && extOk) return cb(null, true);
  cb(new Error('Only JPG and PNG images are allowed'));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });