import dbConnect from '../db.js'
import Feeder from '../models/Feeder.js'

export default async function handler(req, res) {
  await dbConnect()

  if (req.method === 'GET') {
    try {
      const feeders = await Feeder.find()
      res.status(200).json(feeders)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch feeders' })
    }
  }

  else if (req.method === 'POST') {
    try {
      const newFeeder = new Feeder(req.body)
      await newFeeder.save()
      res.status(201).json(newFeeder)
    } catch (err) {
      res.status(400).json({ error: 'Failed to create feeder' })
    }
  }

  else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
