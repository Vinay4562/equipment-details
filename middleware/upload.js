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

export const upload = multer({ storage });