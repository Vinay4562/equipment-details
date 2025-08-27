import express from 'express';
import Feeder, { VOLTAGE_LEVELS } from '../models/Feeder.js';
const router = express.Router();

// Seed default feeders (idempotent)
router.post('/seed', async (req,res) => {
  const defaults = [
    // 400KV feeders in specified order
    { name:'400KV MAHESHWARAM-2', code:'400KV_MW-2', voltage:'400KV' },
    { name:'400KV MAHESHWARAM-1', code:'400KV_MW-1', voltage:'400KV' },
    { name:'400KV NARSAPUR-1',    code:'400KV_NS-1', voltage:'400KV' },
    { name:'400KV NARSAPUR-2',    code:'400KV_NS-2', voltage:'400KV' },
    { name:'400KV KETHIREDDYPALLY-1', code:'400KV_KP-1', voltage:'400KV' },
    { name:'400KV KETHIREDDYPALLY-2', code:'400KV_KP-2', voltage:'400KV' },
    { name:'400KV NIZAMABAD-1',   code:'400KV_NZ-1', voltage:'400KV' },
    { name:'400KV NIZAMABAD-2',   code:'400KV_NZ-2', voltage:'400KV' },
    // 220KV feeders in specified order
    { name:'220KV PARIGI-1', code:'220KV_PG-1', voltage:'220KV' },
    { name:'220KV PARIGI-2', code:'220KV_PG-2', voltage:'220KV' },
    { name:'220KV THANDUR',  code:'220KV_TD',  voltage:'220KV' },
    { name:'220KV GACHIBOWLI-1', code:'220KV_GB-1', voltage:'220KV' },
    { name:'220KV GACHIBOWLI-2', code:'220KV_GB-2', voltage:'220KV' },
    { name:'220KV KETHIREDDYPALLY', code:'220KV_KP', voltage:'220KV' },
    { name:'220KV YEDDUMAILARAM-1', code:'220KV_YM-1', voltage:'220KV' },
    { name:'220KV YEDDUMAILARAM-2', code:'220KV_YM-2', voltage:'220KV' },
    { name:'220KV SADASIVAPET-1', code:'220KV_SP-1', voltage:'220KV' },
    { name:'220KV SADASIVAPET-2', code:'220KV_SP-2', voltage:'220KV' },
    // ICTs
    { name:"315MVA ICT-1", code:'ICT-1', voltage:'ICT' },
    { name:"315MVA ICT-2", code:'ICT-2', voltage:'ICT' },
    { name:"315MVA ICT-3", code:'ICT-3', voltage:'ICT' },
    { name:"500MVA ICT-4", code:'ICT-4', voltage:'ICT' },
  ];

  for (const f of defaults) {
    await Feeder.updateOne({ name:f.name, voltage:f.voltage }, { $set: f }, { upsert: true });
  }
  const all = await Feeder.find().sort({ voltage:1, name:1 });
  res.json({ ok:true, count: all.length, feeders: all });
});

router.get('/', async (req,res)=>{
  const { voltage } = req.query;
  const filter = {};
  if (voltage) filter.voltage = voltage;
  
  // Custom sorting to maintain the specified order
  const rows = await Feeder.find(filter);
  
  // Sort based on voltage and predefined order
  const sortOrder = {
    '400KV': [
      '400KV MAHESHWARAM-2',
      '400KV MAHESHWARAM-1', 
      '400KV NARSAPUR-1',
      '400KV NARSAPUR-2',
      '400KV KETHIREDDYPALLY-1',
      '400KV KETHIREDDYPALLY-2',
      '400KV NIZAMABAD-1',
      '400KV NIZAMABAD-2'
    ],
    '220KV': [
      '220KV PARIGI-1',
      '220KV PARIGI-2',
      '220KV THANDUR',
      '220KV GACHIBOWLI-1',
      '220KV GACHIBOWLI-2',
      '220KV KETHIREDDYPALLY',
      '220KV YEDDUMAILARAM-1',
      '220KV YEDDUMAILARAM-2',
      '220KV SADASIVAPET-1',
      '220KV SADASIVAPET-2'
    ],
    'ICT': [
      '315MVA ICT-1',
      '315MVA ICT-2', 
      '315MVA ICT-3',
      '500MVA ICT-4'
    ]
  };
  
  const sortedRows = rows.sort((a, b) => {
    if (a.voltage !== b.voltage) {
      return a.voltage.localeCompare(b.voltage);
    }
    const order = sortOrder[a.voltage] || [];
    const aIndex = order.indexOf(a.name);
    const bIndex = order.indexOf(b.name);
    if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  res.json(sortedRows);
});

export default router;