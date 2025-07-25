// src/interfaces/routes/seatLayout.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { ISeatLayoutController } from '../controllers/interface/seatLayoutMng.controller.interface';

const seatLayoutController = container.resolve<ISeatLayoutController>('SeatLayoutController');

const router = Router();

router.post(
  '/create-seat-layout',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  (req, res, next) => seatLayoutController.createSeatLayout(req, res, next),
);
router.get('/fetch-seats', verifyAccessToken, authorizeRoles(['vendor']), (req, res, next) =>
  seatLayoutController.findSeatLayoutsByVendor(req, res, next),
);
router.put('/update-seats/:id', verifyAccessToken, authorizeRoles(['vendor']), (req, res, next) =>
  seatLayoutController.updateSeatLayout(req, res, next),
);
router.get('/find-seats/:id', verifyAccessToken, authorizeRoles(['vendor']), (req, res, next) =>
  seatLayoutController.findSeatLayoutById(req, res, next),
);
export default router;
