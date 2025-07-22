import { Router } from 'express';
import { container } from 'tsyringe';
import { validateRequest } from '../middleware/validate.middleware';
import { IUserAuthController } from '../controllers/interface/userAuth.controller.interface';
import { VerifyOtpSchema, SendOtpSchema } from '../validation/userAuth.validation';

const userAuthController = container.resolve<IUserAuthController>('UserAuthController');

const router = Router();

router.post('/google/callback', userAuthController.googleCallback.bind(userAuthController));
router.post('/refresh-token', userAuthController.refreshToken.bind(userAuthController));
router.post(
  '/send-otp',
  validateRequest(SendOtpSchema),
  userAuthController.sendOtp.bind(userAuthController),
);
router.post(
  '/verify-otp',
  validateRequest(VerifyOtpSchema),
  userAuthController.verifyOtp.bind(userAuthController),
);
router.post('/login', (req, res, next) => userAuthController.login(req, res, next));
router.post('/logout', (req, res, next) => userAuthController.logout(req, res, next));
router.post('/fg-verify-otp', (req, res, next) =>
  userAuthController.forgotPassVerifyOtp(req, res, next),
);
router.post('/fg-send-otp', (req, res, next) =>
  userAuthController.forgotPassSendOtp(req, res, next),
);
router.post('/fg-update-pass', (req, res, next) =>
  userAuthController.forgotPassUpdatePassword(req, res, next),
);

export default router;
