import mongoose, { Schema } from 'mongoose';

export const VOLTAGE_LEVELS = ['400KV', '220KV', 'ICT'];

const feederSchema = new Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, unique: true, required: true },
  voltage: { type: String, enum: VOLTAGE_LEVELS, required: true },
  enabled: { type: Boolean, default: true },
}, { timestamps: true });

feederSchema.index({ voltage: 1, name: 1 }, { unique: true });

export default mongoose.model('Feeder', feederSchema);