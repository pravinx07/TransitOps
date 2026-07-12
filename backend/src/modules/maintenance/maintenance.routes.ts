import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  completeMaintenance,
} from './maintenance.controller';

const router = Router();

// Protect all routes with auth
router.use(authenticate);

router.get('/', getMaintenanceRecords);
router.post('/', requireRole('FLEET_MANAGER', 'MAINTENANCE_TECH'), createMaintenanceRecord);
router.put('/:id/complete', requireRole('FLEET_MANAGER', 'MAINTENANCE_TECH'), completeMaintenance);

export default router;
