import { Router } from 'express';
import { IVendorAuthController } from '../controllers/interface/theaterAuth.controller.interface';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { SendOtpSchema} from '../validation/userAuth.validation';


const VendorAuthController = container.resolve<IVendorAuthController>('VendorAuthController');

const router = Router();

router.post('/send-otp', validateRequest(SendOtpSchema) ,VendorAuthController.sendOtp.bind(VendorAuthController));
router.post('/login', VendorAuthController.login.bind(VendorAuthController));
router.post('/verify-otp', VendorAuthController.verifyOtp.bind(VendorAuthController));
router.post('/update-vendor', VendorAuthController.updateTheaterDetails.bind(VendorAuthController));

export default router;