import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { CreateScreenSchema, UpdateScreenSchema } from '../validation/screen.validation';
import { IScreenManagementController } from '../controllers/interface/screenMng.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

const ScreenMngController = container.resolve<IScreenManagementController>(
  'ScreenManagementController',
);

const router = Router();

// Fetch screens for a vendor
router.get(
  '/fetch',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  ScreenMngController.getScreensOfVendor.bind(ScreenMngController),
);

// Create a new screen
router.post(
  '/create',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  validateRequest(CreateScreenSchema),
  ScreenMngController.createScreen.bind(ScreenMngController),
);

// Update an existing screen
router.put(
  '/update/:id',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  validateRequest(UpdateScreenSchema),
  ScreenMngController.updateScreen.bind(ScreenMngController),
);

export default router;
