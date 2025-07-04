import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { SendOtpSchema } from '../validation/userAuth.validation';
import { ITheaterManagementController } from '../controllers/interface/theaterMng.controller.interface';

const TheaterMngController =
  container.resolve<ITheaterManagementController>('TheaterMngController');

const router = Router();

router.get(
  '/fetchAll',
  verifyAccessToken,
  TheaterMngController.getTheaters.bind(TheaterMngController),
);
router.get(
  '/fetch-vendor',
  verifyAccessToken,
  TheaterMngController.getTheatersOfVendor.bind(TheaterMngController),
);
router.get(
  '/fetch-admin',
  verifyAccessToken,
  TheaterMngController.fetchTheatersByAdmin.bind(TheaterMngController),
);
router.patch(
  '/update-theater-status/:id',
  verifyAccessToken,
  TheaterMngController.updateTheaterStatus.bind(TheaterMngController),
);
router.patch(
  '/update-theater/:id',
  verifyAccessToken,
  TheaterMngController.updateTheater.bind(TheaterMngController),
);

export default router;
