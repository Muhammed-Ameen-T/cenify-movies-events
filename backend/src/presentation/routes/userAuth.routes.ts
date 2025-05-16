import { Router } from 'express';
import 'reflect-metadata';
import '../../infrastructure/container';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { IUserAuthController } from '../controllers/interface/userAuth.controller.interface';
import { VerifyOtpSchema, SendOtpSchema } from '../validation/userAuth.validation';

const userAuthController = container.resolve<IUserAuthController>('UserAuthController');

const   router = Router();

router.post('/google/callback', userAuthController.googleCallback.bind(userAuthController));
router.post('/refresh-token', userAuthController.refreshToken.bind(userAuthController));
// router.get('/me', verifyAccessToken, userAuthController.getCurrentUser.bind(userAuthController));
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
router.post('/login', (req, res) => userAuthController.login(req, res));
router.post('/logout', (req,res) => userAuthController.logout(req,res));
router.post('/fg-verify-otp', (req,res) => userAuthController.forgotPassVerifyOtp(req,res));
router.post('/fg-send-otp', (req,res) => userAuthController.forgotPassSendOtp(req,res));
router.post('/fg-update-pass', (req,res) => userAuthController.forgotPassUpdatePassword(req,res));

export default router;
