// src/interfaces/http/routes/seatSelection.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { ISeatSelectionController } from '../controllers/interface/seatSelection.controller.interface';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();
const seatSelectionController =
  container.resolve<ISeatSelectionController>('SeatSelectionController');

router.get('/:showId', (req, res, next) =>
  seatSelectionController.getSeatSelection(req, res, next),
);
router.post('/:showId/select', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  seatSelectionController.selectSeats(req, res, next),
);

export default router;
