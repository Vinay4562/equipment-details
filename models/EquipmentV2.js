import mongoose, { Schema } from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export const EQUIPMENT_TYPES = ['CT','CVT','ICT','CB','ISOLATOR','LA','PT','BUSBAR','WAVETRAP'];

// Define nested schemas for each equipment type

const ctSchema = new Schema({
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  ratio: String,
  accuracyMetering: String,
  accuracyProtection: String,
  burdenVA: Number,
  shortTimeCurrentKA_3s: Number,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const cvtSchema = new Schema({
  ratedVoltageKV: Number,
  secondaryVoltageV: String,
  accuracyMetering: String,
  accuracyProtection: String,
  burdenVA: Number,
  plccCoupling: { type: Boolean, default: false },
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const ictSchema = new Schema({
  type: { type: String, default: '3Φ Oil-immersed' },
  powerMVA: Number,
  primaryKV: Number,
  secondaryKV: Number,
  tertiaryKV: Number,
  vectorGroup: String,
  impedancePercent: Number,
  cooling: String,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const ptSchema = new Schema({
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  ratio: String,
  accuracyMetering: String,
  accuracyProtection: String,
  burdenVA: Number,
  shortTimeCurrentKA_3s: Number,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const cbSchema = new Schema({
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  type: String,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const isolatorSchema = new Schema({
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  type: String,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const laSchema = new Schema({
  ratedVoltageKV: Number,
  energyAbsorptionJ: Number,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const busbarSchema = new Schema({
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  material: String,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const wavetrapSchema = new Schema({
  ratedVoltageKV: Number,
  impedanceOhm: Number,
  manufacturer: String,
  model: String,
  serialNo: String,
  year: String,
  frequencyHz: { type: Number, default: 50 },
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
}, { _id: false });

const equipmentSchema = new Schema({
  station: { type: String, default: '400kV Shankarpally', index: true },
  voltage: { type: String, required: true, enum: ['400KV','220KV','ICT'] },
  feederId: { type: Schema.Types.ObjectId, ref: 'Feeder', required: true },
  feederName: { type: String, required: true },
  equipmentType: { type: String, enum: EQUIPMENT_TYPES, required: true },
  title: { type: String, required: true, trim: true },
  imageUrl: { type: String },

  // Nested subdocuments
  ct: ctSchema,
  cvt: cvtSchema,
  ict: ictSchema,
  pt: ptSchema,
  cb: cbSchema,
  isolator: isolatorSchema,
  la: laSchema,
  busbar: busbarSchema,
  wavetrap: wavetrapSchema,

  // Generic key-value pairs for other equipment
  attrs: [{ key: String, value: String }],
}, { timestamps: true });

equipmentSchema.index({ feederId: 1, equipmentType: 1, title: 1 }, { unique: true });

export default mongoose.model('EquipmentV2', equipmentSchema);
