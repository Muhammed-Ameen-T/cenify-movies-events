import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {} from '../validation/userAuth.validation';
import { IUserProfileController } from '../controllers/interface/userProfile.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

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
  userAuthController.updateUserProfile.bind(userAuthController),
);
router.get(
  '/wallet',
  verifyAccessToken,
  userAuthController.findUserWallet.bind(userAuthController),
);
router.get(
  '/transactions',
  verifyAccessToken,
  userAuthController.findUserWalletTransactions.bind(userAuthController),
);
router.get(
  '/content',
  verifyAccessToken,
  userAuthController.findProfileContents.bind(userAuthController),
);
router.put(
  '/changePassword',
  verifyAccessToken,
  userAuthController.changePassword.bind(userAuthController),
);

router.put(
  '/redeem-points',
  verifyAccessToken,
  userAuthController.redeemLoyaltyPoints.bind(userAuthController),
);

export default router;
