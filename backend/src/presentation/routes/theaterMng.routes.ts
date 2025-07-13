import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { SendOtpSchema } from '../validation/userAuth.validation';
import { ITheaterManagementController } from '../controllers/interface/theaterMng.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

const TheaterMngController =
  container.resolve<ITheaterManagementController>('TheaterMngController');

const router = Router();

router.get(
  '/fetchAll',
  verifyAccessToken,
  authorizeRoles(['user','admin','vendor']),
  TheaterMngController.getTheaters.bind(TheaterMngController),
);
router.get(
  '/fetch-vendor',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  TheaterMngController.getTheatersOfVendor.bind(TheaterMngController),
);
router.get(
  '/fetch-admin',
  verifyAccessToken,
  authorizeRoles(['admin']),
  TheaterMngController.fetchTheatersByAdmin.bind(TheaterMngController),
);
router.patch(
  '/update-theater-status/:id',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  TheaterMngController.updateTheaterStatus.bind(TheaterMngController),
);
router.patch(
  '/update-theater/:id',
  verifyAccessToken,
  authorizeRoles(['vendor','admin']),
  TheaterMngController.updateTheater.bind(TheaterMngController),
);

export default router;
