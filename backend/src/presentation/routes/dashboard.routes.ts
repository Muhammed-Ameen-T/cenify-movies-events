import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { IDashboardController } from '../controllers/interface/dashboard.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

const DashboardController = container.resolve<IDashboardController>('DashboardController');

const router = Router();

router.get(
  '/vendor',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  DashboardController.getDashboardData.bind(DashboardController),
);
router.get(
  '/admin',
  verifyAccessToken,
  authorizeRoles(['admin']),
  DashboardController.getAdminDashboardData.bind(DashboardController),
);

export default router;
