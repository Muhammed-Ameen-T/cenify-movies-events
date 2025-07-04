// src/interfaces/routes/seatLayout.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { ISeatLayoutController } from '../controllers/interface/seatLayoutMng.controller.interface';

const seatLayoutController = container.resolve<ISeatLayoutController>('SeatLayoutController');

const router = Router();

router.post('/create-seat-layout', verifyAccessToken, authorizeRoles(['vendor']), (req, res) =>
  seatLayoutController.createSeatLayout(req, res),
);
router.get('/fetch-seats', verifyAccessToken, authorizeRoles(['vendor']), (req, res) =>
  seatLayoutController.findSeatLayoutsByVendor(req, res),
);
router.put('/update-seats/:id', verifyAccessToken, authorizeRoles(['vendor']), (req, res) =>
  seatLayoutController.updateSeatLayout(req, res),
);
router.get('/find-seats/:id', verifyAccessToken, authorizeRoles(['vendor']), (req, res) =>
  seatLayoutController.findSeatLayoutById(req, res),
);
export default router;