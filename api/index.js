import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import feederRoutes from '../routes/feederRoutes.js';
import equipmentRoutes from '../routes/equipmentRoutes.js';
import { createToken, requireAuth } from '../middleware/auth.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static files (note: serverless storage is ephemeral)
const uploadsPath = process.env.VERCEL ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint (under the function base "/api")
app.get('/health', (_req, res) => res.json({ ok: true }));

// Auth (function base is "/api")
app.post('/auth/login', (req, res) => {
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

// API Routes (function base is "/api")
app.use('/feeders', feederRoutes);
app.use('/equipment', (req, res, next) => {
  if (req.method === 'POST' || req.method === 'DELETE') return requireAuth(req, res, next);
  next();
}, equipmentRoutes);

// MongoDB connection setup
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'shankarpally_substation',
    });
    console.log('MongoDB connected');
  }
};

// Connect to DB once per cold start
connectDB().catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Export app as Vercel serverless function handler
export default app;
