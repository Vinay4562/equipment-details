import dbConnect from '../db.js'
import Equipment from '../models/Equipment.js'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'GET') {
    try {
      const equipment = await Equipment.find()
      res.status(200).json(equipment)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch equipment' })
    }
  }

  else if (req.method === 'POST') {
    try {
      const newEquipment = new Equipment(req.body)
      await newEquipment.save()
      res.status(201).json(newEquipment)
    } catch (err) {
      res.status(400).json({ error: 'Failed to create equipment' })
    }
  }

  else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
