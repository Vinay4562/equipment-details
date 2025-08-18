import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import feederRoutes from '../routes/feederRoutes.js';
import equipmentRoutes from '../routes/equipmentRoutes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Static files (adjust path as needed)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API Routes
app.use('/api/feeders', feederRoutes);
app.use('/api/equipment', equipmentRoutes);

// MongoDB connection setup
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
