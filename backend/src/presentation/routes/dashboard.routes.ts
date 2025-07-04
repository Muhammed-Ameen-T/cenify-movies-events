import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { IDashboardController } from '../controllers/interface/dashboard.controller.interface';

const DashboardController = container.resolve<IDashboardController>('DashboardController');

const router = Router();

router.get(
  '/vendor',
  verifyAccessToken,
  DashboardController.getDashboardData.bind(DashboardController),
);
router.get(
  '/admin',
  verifyAccessToken,
  DashboardController.getAdminDashboardData.bind(DashboardController),
);

export default router;
