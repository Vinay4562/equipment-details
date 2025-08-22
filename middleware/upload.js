import multer from 'multer';
import path from 'path';
import fs from 'fs';

const isVercel = !!process.env.VERCEL;

// For Vercel serverless, do NOT write to disk (ephemeral). Use memory and upload to Blob in controller.
let uploadsDir = null;
if (!isVercel) {
  uploadsDir = path.join(process.cwd(), 'server', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = !isVercel && multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, uploadsDir); },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi,'_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const storage = isVercel ? multer.memoryStorage() : diskStorage;

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