// routes/shipmentRoutes.js
import express from 'express';
import { createShipment, getWarehouses, getVendors, getAllShipments } from '../controllers/shipmentController.js';

const router = express.Router();

router.get('/',getAllShipments);
router.get('/warehouses', getWarehouses);
router.get('/vendors', getVendors);
router.post('/', createShipment);

export default router;