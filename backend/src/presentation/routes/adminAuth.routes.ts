import { Router } from 'express';
import { authMiddleware } from '../../presentation/middleware/auth.middleware';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { IAdminAuthController } from '../controllers/interface/adminAuth.controller.interface';
import { container } from 'tsyringe';

const adminAuthController = container.resolve<IAdminAuthController>('AdminAuthController');

const router = Router();

router.post('/login', adminAuthController.login.bind(adminAuthController));

export default router;
