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

const ShowMngController = container.resolve<IShowManagementController>('ShowManagementController');

const router = Router();

// Fetch all shows
router.get('/fetch', verifyAccessToken, ShowMngController.getAllShows.bind(ShowMngController));

// Fetch shows for a vendor
router.get(
  '/fetch-vendor',
  verifyAccessToken,
  ShowMngController.getShowsOfVendor.bind(ShowMngController),
);

// Fetch a show by ID
router.get('/find/:id', verifyAccessToken, ShowMngController.getShowById.bind(ShowMngController));

// Create a new show
router.post(
  '/create',
  verifyAccessToken,
  validateRequest(CreateShowSchema),
  ShowMngController.createShow.bind(ShowMngController),
);

// Update an existing show
router.put(
  '/update/:id',
  verifyAccessToken,
  // validateRequest(UpdateShowSchema),
  ShowMngController.updateShow.bind(ShowMngController),
);

// Update show status
router.patch(
  '/status/:id',
  verifyAccessToken,
  // validateRequest(UpdateShowStatusSchema),
  ShowMngController.updateShowStatus.bind(ShowMngController),
);

// Delete a show
router.delete(
  '/delete/:id',
  verifyAccessToken,
  ShowMngController.deleteShow.bind(ShowMngController),
);

// Fetch Show Selection
router.get(
  '/selection/:movieId',
  // verifyAccessToken,
  ShowMngController.getShowSelection.bind(ShowMngController),
);

// Create Reccuring Shows
router.post('/recurring', verifyAccessToken, (req, res) =>
  ShowMngController.createRecurringShow(req, res),
);

export default router;
