import express from 'express';
import { 
  createShipment, 
  getWarehouses, 
  getVendors, 
  getAllShipments,
  getSingleShipment,
  updateShipment,
  deleteShipment
} from '../controllers/shipmentController.js';

const router = express.Router();

router.get('/', getAllShipments);
router.get('/warehouses', getWarehouses);
router.get('/vendors', getVendors);

router.get('/:id', getSingleShipment);   // ✅ Show shipment
router.put("/:id", updateShipment);
router.delete('/:id', deleteShipment);   // ✅ Delete shipment

router.post('/', createShipment);

export default router;