import multer from 'multer';
import path from 'path';
import fs from 'fs';

// For Vercel serverless, use /tmp directory which is writable
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi,'_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

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