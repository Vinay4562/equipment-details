import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI/MONGODB_URI missing');
  await mongoose.connect(uri, { dbName: 'shankarpally_substation' });
  console.log('✅ MongoDB connected');
};