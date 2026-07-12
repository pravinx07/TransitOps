import { Router } from 'express';
import { getTrips, createTrip, updateTripStatus } from './trips.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(authenticate);

// Drivers can view trips (to see their own, but we return all for now)
router.get('/', requireRole('FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER'), getTrips);

// Only Dispatcher/Manager can create or dispatch
router.post('/', requireRole('FLEET_MANAGER'), createTrip);
router.put('/:id/status', requireRole('FLEET_MANAGER', 'DRIVER'), updateTripStatus);

export default router;
