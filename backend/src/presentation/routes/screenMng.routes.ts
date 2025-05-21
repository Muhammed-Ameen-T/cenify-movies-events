import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { CreateScreenSchema, UpdateScreenSchema } from '../validation/screen.validation';
import { IScreenManagementController } from '../controllers/interface/screenMng.controller.interface';

const ScreenMngController = container.resolve<IScreenManagementController>('ScreenManagementController'); // Fixed token name

const router = Router();

// Fetch screens for a vendor
router.get(
  '/fetch',
  verifyAccessToken,
  ScreenMngController.getScreensOfVendor.bind(ScreenMngController)
);

// Create a new screen
router.post(
  '/create',
  verifyAccessToken,
  validateRequest(CreateScreenSchema),
  ScreenMngController.createScreen.bind(ScreenMngController)
);

// Update an existing screen
router.put(
  '/update/:id',
  verifyAccessToken,
  validateRequest(UpdateScreenSchema),
  ScreenMngController.updateScreen.bind(ScreenMngController)
);

export default router;