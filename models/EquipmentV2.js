import mongoose, { Schema } from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

export const EQUIPMENT_TYPES = ['CT','CVT','ICT','CB','ISOLATOR','LA','PT','BUSBAR','WAVETRAP'];

// Define nested schemas for each equipment type

const ctSchema = new Schema({
  // Detailed CT nameplate fields
  manufacturer: String,
  type: String, // Type / Type Designation
  serialNo: String, // Serial No. / Sl. No. / Sr. No.
  year: String, // Year of Manufacturing

  // System voltage
  highestSystemVoltageKV: Number, // HSV / NSV / Rated System Voltage / Highest System Voltage
  frequencyHz: { type: Number, default: 50 },

  // Standards/specification
  referenceStandard: String, // Reference Standard(s) / Specification

  // Insulation
  basicInsulationLevelKVp: Number, // BIL (kVp)
  insulationLevel: String, // Insulation Level (I.L.)

  // Short-time/dynamic current ratings
  ithKA_1s: Number, // Ith (kA/1s)
  idynKA: Number, // Idyn (kA)

  // Current ratings
  ratedThermalCurrentA: Number, // Rated Thermal/Continuous Current
  ratedContinuousCurrentA: Number,
  ratedExtendedPrimaryCurrentA: Number,
  ratedPrimaryCurrentA: Number,
  ratedSecondaryCurrentA: Number,
  ratio: String, // Primary/Secondary Current Ratio / Ratio
  ratioOutput2000to1: String, // 2000/1 Ratio Output (if special)

  // Burden/accuracy
  outputVA: Number, // Output (VA) / Rated Burden (VA)
  ratedBurdenVA: Number,
  accuracyClass: String, // Accuracy Class
  isfOrAlf: String, // I.S.F / ALF

  // Creepage / connections / cores
  creepageDistanceMm: Number, // Normal / Nominal / Total Creepage Distance
  cores: String, // Cores / Compensating Core
  primaryConnection: String,
  secondaryConnection: String,

  // Electrical parameters
  resistanceAt75C_Ohm: Number, // Rct at 75°C (Ohms)
  kneePointVoltageVk: Number, // KPV / Vk
  excitationCurrentAtVk_mA: Number, // Magnetizing Current at Vk (mA)

  // Masses / oil
  oilWeightKg: Number, // Oil Weight / Quantity of Oil
  totalWeightKg: Number, // Total Weight / Total Mass

  // Misc
  soNo: String, // S.O. No. (if available)

  // Legacy/compat fields kept
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  accuracyMetering: String,
  accuracyProtection: String,
  burdenVA: Number,
  shortTimeCurrentKA_3s: Number,
  model: String,
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
  // Basic
  type: { type: String, default: '3Φ Oil-immersed' },
  manufacturer: String,
  model: String,
  makersSerialNo: String,
  serialNo: String, // legacy alias
  year: String,
  connectionSymbol: String,
  vectorGroup: String,
  cooling: String, // Type of Cooling

  // Ratings
  powerMVA: Number, // Rated Power (MVA)
  primaryKV: Number, // HV (legacy)
  secondaryKV: Number, // IV (legacy)
  tertiaryKV: Number, // LV (legacy)
  ratedVoltageAtNoLoad: {
    hv: Number,
    iv: Number,
    lv: Number,
  },
  ratedLineCurrent: {
    hv: Number,
    iv: Number,
    lv: Number,
  },
  numPhases: Number, // No. of Phases
  frequencyHz: { type: Number, default: 50 }, // Frequency

  // Drawings and docs
  diagramDrgNo: String,
  ogaDrawingNo: String,

  // Temperature rise
  temperature: {
    maxTempRiseOilC: Number,
    maxTempRiseWindingC: Number,
    overAmbientTempC: Number,
  },

  // Masses and oil volume
  mass: {
    coreAndWindingsKg: Number,
    totalMassKg: Number,
    transportMassKg: Number,
    untankingMassKg: Number,
    oilVolumeLiters: Number,
  },

  // Impedance voltage at base
  impedanceVoltage: {
    baseMVA: { type: Number, default: 315 },
    guaranteed: {
      hv_iv: Number,
      hv_lv: Number,
      iv_lv: Number,
    },
    measured: {
      hv_iv: Number,
      hv_lv: Number,
      iv_lv: Number,
    }
  },

  // Losses
  losses: {
    noLoadKW: Number,
    loadKW: Number,
    coolerKW: Number,
  },

  // Insulation levels (kept as string to allow composite values)
  insulationLevel: {
    hv: String,
    iv: String,
    lv: String,
    n: String,
  },

  // Legacy insulation fields
  insulationImpulseKVp: Number,
  insulationPowerFreqKV: Number,
  // Other
  impedancePercent: Number,
}, { _id: false });

const ptSchema = new Schema({
  // New detailed PT nameplate fields
  type: String,
  specification: String,
  soNo: String, // S.O. No.
  manufacturer: String,
  year: String, // Year of Manufacture
  serialNo: String,
  highestSystemVoltageKV: Number, // HSV
  frequencyHz: { type: Number, default: 50 },
  insulationLevel: String,
  voltageFactor: String,
  creepageDistanceMm: Number,
  totalWeightKg: Number,
  oilWeightKg: Number,
  secondaryVoltages: String, // keep as string for composite values
  ratedBurdenVA: Number,
  accuracyClass: String,
  primaryVoltageKV: Number,

  // Legacy fields kept for backward compatibility
  ratedVoltageKV: Number,
  ratedCurrentA: Number,
  ratio: String,
  accuracyMetering: String,
  accuracyProtection: String,
  burdenVA: Number,
  shortTimeCurrentKA_3s: Number,
  model: String,
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
