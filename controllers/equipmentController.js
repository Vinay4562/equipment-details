import Equipment from '../models/Equipment.js';
import Feeder from '../models/Feeder.js';

// Create equipment
export const createEquipment = async (req, res) => {
  try {
    const { station, voltage, feederId, equipmentType, title, payload } = req.body;
    const feeder = await Feeder.findById(feederId);
    if (!feeder) return res.status(400).json({ error: 'Invalid feederId' });

    const doc = new Equipment({
      station: station || '400kV Shankarpally',
      voltage,
      feederId,
      feederName: feeder.name,
      equipmentType,
      title,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
      ...(payload ? JSON.parse(payload) : {}),
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
