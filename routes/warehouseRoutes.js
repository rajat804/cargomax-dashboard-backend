import express from 'express';
import { createWarehouse, getWarehouses } from '../controllers/warehouseController.js';

const router = express.Router();

router.post('/', createWarehouse);
router.get('/', getWarehouses);

export default router;