import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {} from '../validation/userAuth.validation';
import { IUserProfileController } from '../controllers/interface/userProfile.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { SendOtpPhoneSchema, VerifyOtpPhoneSchema } from '../validation/profile.validation';

const userAuthController = container.resolve<IUserProfileController>('UserProfileController');

const router = Router();

router.get(
  '/me',
  verifyAccessToken,
  authorizeRoles(['user']),
  userAuthController.getCurrentUser.bind(userAuthController),
);
router.patch(
  '/update',
  verifyAccessToken,
  authorizeRoles(['user']),
  userAuthController.updateUserProfile.bind(userAuthController),
);
router.get(
  '/wallet',
  verifyAccessToken,
  authorizeRoles(['user', 'admin', 'vendor']),
  userAuthController.findUserWallet.bind(userAuthController),
);
router.get(
  '/transactions',
  verifyAccessToken,
  authorizeRoles(['user', 'admin', 'vendor']),
  userAuthController.findUserWalletTransactions.bind(userAuthController),
);
router.get(
  '/content',
  verifyAccessToken,
  authorizeRoles(['user']),
  userAuthController.findProfileContents.bind(userAuthController),
);
router.put(
  '/changePassword',
  verifyAccessToken,
  authorizeRoles(['user']),
  userAuthController.changePassword.bind(userAuthController),
);

router.put(
  '/redeem-points',
  verifyAccessToken,
  authorizeRoles(['user']),
  userAuthController.redeemLoyaltyPoints.bind(userAuthController),
);

router.post(
  '/send-otp-phone',
  verifyAccessToken,
  authorizeRoles(['user']),
  validateRequest(SendOtpPhoneSchema),
  userAuthController.sendOtpPhone.bind(userAuthController),
);

router.post(
  '/verify-otp-phone',
  verifyAccessToken,
  authorizeRoles(['user']),
  validateRequest(VerifyOtpPhoneSchema),
  userAuthController.verifyOtpPhone.bind(userAuthController),
);

router.post(
  '/wallet-withdraw',
  verifyAccessToken,
  authorizeRoles(['vendor']),
  userAuthController.withdrawFromWallet.bind(userAuthController),
);

export default router;
