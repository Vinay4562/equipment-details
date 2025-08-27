import Equipment from '../models/EquipmentV2.js';
import Feeder from '../models/Feeder.js';

// Create equipment
export const createEquipment = async (req, res) => {
  try {
    const { station, voltage, feederId, equipmentType, title, payload } = req.body;
    const feeder = await Feeder.findById(feederId);
    if (!feeder) return res.status(400).json({ error: 'Invalid feederId' });

    let parsedPayload = {};
    if (payload) {
      parsedPayload = JSON.parse(payload);
      console.log('Parsed payload:', parsedPayload);

      // Check if any nested equipment block like 'cb' is wrongly a string
      const nestedKeys = ['ct', 'cvt', 'ict', 'pt', 'cb', 'isolator', 'la', 'busbar', 'wavetrap'];
      for (const key of nestedKeys) {
        if (key in parsedPayload && typeof parsedPayload[key] === 'string') {
          console.warn(`Warning: Payload key "${key}" is a string but should be an object.`);
          return res.status(400).json({ error: `Invalid payload: "${key}" field must be an object, not string.` });
        }
      }
    }

    // Determine image URL (always embed as data URL to avoid ephemeral disk issues)
    let imageUrl;
    if (req.file) {
      const base64 = req.file.buffer?.toString('base64');
      const mime = req.file.mimetype || 'image/png';
      if (base64) imageUrl = `data:${mime};base64,${base64}`;
    }

    const doc = new Equipment({
      station: station || '400kV Shankarpally',
      voltage,
      feederId,
      feederName: feeder.name,
      equipmentType,
      title,
      imageUrl,
      ...parsedPayload,
    });

    const saved = await doc.save();
    res.json(saved);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ error: 'Duplicate: this equipment already exists for the feeder' });
    }
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// List/search equipment
export const listEquipment = async (req, res) => {
  try {
    const { voltage, feederId, equipmentType, q, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (voltage) filter.voltage = voltage;
    if (feederId) filter.feederId = feederId;
    if (equipmentType) filter.equipmentType = equipmentType;
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { feederName: new RegExp(q, 'i') },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Equipment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Equipment.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get one
export const getEquipmentById = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete
export const deleteEquipment = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Equipment not found' });

    await Equipment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Equipment deleted successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update
export const updateEquipment = async (req, res) => {
  try {
    const { station, voltage, feederId, equipmentType, title, payload } = req.body;

    const update = {};
    if (station) update.station = station;
    if (voltage) update.voltage = voltage;
    if (feederId) {
      const feeder = await Feeder.findById(feederId);
      if (!feeder) return res.status(400).json({ error: 'Invalid feederId' });
      update.feederId = feederId;
      update.feederName = feeder.name;
    }
    if (equipmentType) update.equipmentType = equipmentType;
    if (title) update.title = title;

    if (req.file) {
      const base64 = req.file.buffer?.toString('base64');
      const mime = req.file.mimetype || 'image/png';
      if (base64) update.imageUrl = `data:${mime};base64,${base64}`;
    }

    if (payload) {
      const parsed = JSON.parse(payload);
      const nestedKeys = ['ct','cvt','ict','pt','cb','isolator','la','busbar','wavetrap'];
      for (const key of nestedKeys) {
        if (key in parsed && typeof parsed[key] === 'string') {
          return res.status(400).json({ error: `Invalid payload: "${key}" field must be an object, not string.` });
        }
      }
      Object.assign(update, parsed);
    }

    const updated = await Equipment.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Equipment not found' });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
};