// routes/managerRoutes.js
import express from 'express';
import { createManager, getManagers } from '../controllers/managerController.js';

const router = express.Router();

router.post('/', createManager);
router.get('/', getManagers);

export default router;