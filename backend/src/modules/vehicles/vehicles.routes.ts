import { Router } from 'express';
import { getVehicles, getAvailableVehicles } from './vehicles.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);

export default router;
