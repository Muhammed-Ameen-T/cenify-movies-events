import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { SendOtpSchema} from '../validation/userAuth.validation';
import { ITheaterManagementController } from '../controllers/interface/theaterMng.controller.interface';


const TheaterMngController = container.resolve<ITheaterManagementController>('TheaterMngController');

const router = Router();

router.get('/fetch-theaters',TheaterMngController.getTheaters.bind(TheaterMngController));
router.patch('/update-theater-status/:id',TheaterMngController.updateTheaterStatus.bind(TheaterMngController));

export default router;      