import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  createEquipment,
  listEquipment,
  getEquipmentById,
  deleteEquipment,
  updateEquipment,
} from '../controllers/equipmentController.js';

const router = express.Router();

// Create equipment (with optional image upload)
router.post('/', upload.single('image'), createEquipment);

// List/search equipment
router.get('/', listEquipment);

// Update equipment
router.put('/:id', upload.single('image'), updateEquipment);

// Get one equipment by id
router.get('/:id', getEquipmentById);

// Delete equipment by id
router.delete('/:id', deleteEquipment);

export default router;
