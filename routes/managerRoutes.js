// routes/managerRoutes.js
import express from 'express';
import { createManager, deleteManager, getManagers, updateManager } from '../controllers/managerController.js';

const router = express.Router();

router.post('/', createManager);
router.get('/', getManagers);
router.put('/:id', updateManager);
router.delete('/:id', deleteManager);

export default router;