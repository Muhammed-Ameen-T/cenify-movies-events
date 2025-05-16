import { Router } from 'express';
import 'reflect-metadata';
import '../../infrastructure/container';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {} from '../validation/userAuth.validation';
import { IUserProfileController } from '../controllers/interface/userProfile.controller.interface';

const userAuthController = container.resolve<IUserProfileController>('UserProfileController');

const router = Router();

router.get('/me', verifyAccessToken, userAuthController.getCurrentUser.bind(userAuthController));
router.patch('/update', verifyAccessToken, userAuthController.updateUserProfile.bind(userAuthController));

export default router;  