import express from 'express';
import { createVendor, getVendors, getVendorById, upload } from '../controllers/vendorController.js';

const router = express.Router();

// ✅ No extra middleware, direct function call
router.post('/', upload.array('documents', 10), createVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);

export default router;