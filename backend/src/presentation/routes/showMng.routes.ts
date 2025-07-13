import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  CreateShowSchema,
  UpdateShowSchema,
  UpdateShowStatusSchema,
} from '../validation/show.validation';
import { IShowManagementController } from '../controllers/interface/showMng.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

const ShowMngController = container.resolve<IShowManagementController>('ShowManagementController');

const router = Router();

// Fetch all shows
router.get('/fetch', verifyAccessToken,authorizeRoles(['vendor','admin','user']), ShowMngController.getAllShows.bind(ShowMngController));

// Fetch shows for a vendor
router.get(
  '/fetch-vendor',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  ShowMngController.getShowsOfVendor.bind(ShowMngController),
);

// Fetch a show by ID
router.get('/find/:id', verifyAccessToken,  authorizeRoles(['vendor','admin','user']), ShowMngController.getShowById.bind(ShowMngController));

// Create a new show
router.post(
  '/create',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  validateRequest(CreateShowSchema),
  ShowMngController.createShow.bind(ShowMngController),
);

// Update an existing show
router.put(
  '/update/:id',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  // validateRequest(UpdateShowSchema),
  ShowMngController.updateShow.bind(ShowMngController),
);

// Update show status
router.patch(
  '/status/:id',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  // validateRequest(UpdateShowStatusSchema),
  ShowMngController.updateShowStatus.bind(ShowMngController),
);

// Delete a show
router.delete(
  '/delete/:id',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  ShowMngController.deleteShow.bind(ShowMngController),
);

// Fetch Show Selection
router.get(
  '/selection/:movieId',
  // verifyAccessToken,
  ShowMngController.getShowSelection.bind(ShowMngController),
);

// Create Reccuring Shows
router.post('/recurring', verifyAccessToken,authorizeRoles(['vendor']), (req, res, next) =>
  ShowMngController.createRecurringShow(req, res, next),
);

export default router;
