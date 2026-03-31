import express from 'express';
import { createWarehouse, getWarehouses, updateWarehouse, deleteWarehouse } from '../controllers/warehouseController.js';

const router = express.Router();

router.post('/', createWarehouse);
router.get('/', getWarehouses);
router.put("/:id", updateWarehouse);
router.delete("/:id", deleteWarehouse);

export default router;