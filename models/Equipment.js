import mongoose, { Schema } from 'mongoose';

export const EQUIPMENT_TYPES = ['CT','CVT','ICT','CB','ISOLATOR','LA','PT','BUSBAR','WAVETRAP'];

const nameplateCommon = {
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
};

const equipmentSchema = new Schema({
  station: { type: String, default: '400kV Shankarpally', index: true },
  voltage: { type: String, required: true, enum: ['400KV','220KV','ICT'] },
  feederId: { type: Schema.Types.ObjectId, ref: 'Feeder', required: true },
  feederName: { type: String, required: true },
  equipmentType: { type: String, enum: ['CT','CVT','ICT','CB','ISOLATOR','LA','PT','BUSBAR','WAVETRAP'], required: true },
  title: { type: String, required: true, trim: true },
  imageUrl: { type: String },
  // Specific blocks
  ct: {
    ratedVoltageKV: Number,
    ratedCurrentA: Number,
    ratio: String,
    accuracyMetering: String,
    accuracyProtection: String,
    burdenVA: Number,
    shortTimeCurrentKA_3s: Number,
    ...nameplateCommon,
  },
  cvt: {
    ratedVoltageKV: Number,
    secondaryVoltageV: String, // e.g. '110/√3'
    accuracyMetering: String,
    accuracyProtection: String,
    burdenVA: Number,
    plccCoupling: { type: Boolean, default: false },
    ...nameplateCommon,
  },
  ict: {
    type: { type: String, default: '3Φ Oil-immersed' },
    powerMVA: Number,
    primaryKV: Number,
    secondaryKV: Number,
    tertiaryKV: Number,
    vectorGroup: String,
    impedancePercent: Number,
    cooling: String, // ONAN/ONAF
    ...nameplateCommon,
  },
  // Generic key-values for other equipment
  attrs: [{ key: String, value: String }],
}, { timestamps: true });

// Prevent duplicates per feeder+type+title
// e.g., one CT nameplate for a specific bay position

equipmentSchema.index({ feederId: 1, equipmentType: 1, title: 1 }, { unique: true });

export default mongoose.model('Equipment', equipmentSchema);