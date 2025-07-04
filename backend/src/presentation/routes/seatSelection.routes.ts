// src/interfaces/http/routes/seatSelection.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { ISeatSelectionController } from '../controllers/interface/seatSelection.controller.interface';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';

const router = Router();
const seatSelectionController =
  container.resolve<ISeatSelectionController>('SeatSelectionController');

router.get('/:showId', verifyAccessToken, (req, res) =>
  seatSelectionController.getSeatSelection(req, res),
);
router.post('/:showId/select', verifyAccessToken, (req, res) =>
  seatSelectionController.selectSeats(req, res),
);

export default router;
// router.get('/:showId', authMiddleware, socketMiddleware, (req, res) => seatSelectionController.getSeatSelection(req, res));
// router.post('/:showId/select', authMiddleware, socketMiddleware, (req, res) => seatSelectionController.selectSeats(req, res));
// import { socketMiddleware } from '../middleware/socket.middleware';
