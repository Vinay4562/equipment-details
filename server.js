import mongoose from 'mongoose';

// Remove cached old and new equipment models to avoid schema conflicts
delete mongoose.models['Equipment'];
delete mongoose.models['EquipmentV2'];

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import feederRoutes from './routes/feederRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import Equipment from './models/EquipmentV2.js';
import { createToken, requireAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || '*' }));

// Static for uploaded images (ensure it points to server/uploads where multer stores files)
app.use('/uploads', express.static(path.join(__dirname, 'server', 'uploads')));

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Auth: simple server-side credential check using .env
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const envUser = process.env.ENTRY_USERNAME;
  const envPass = process.env.ENTRY_PASSWORD;
  if (!envUser || !envPass) return res.status(500).json({ error: 'Credentials not configured' });
  if (username === envUser && password === envPass) {
    const token = createToken(username);
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Routes
app.use('/api/feeders', feederRoutes);
// Protect equipment write operations
app.use('/api/equipment', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'DELETE') return requireAuth(req, res, next);
  next();
}, equipmentRoutes); // ✅ singular

const start = async () => {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
};

start();
