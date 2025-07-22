import { Router } from 'express';
import { container } from 'tsyringe';
import { MoviePassController } from '../controllers/moviePass.controller';
import { StripeWebhookController } from '../controllers/stripeWebhook.controller';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();
const moviePassController = container.resolve(MoviePassController);
const stripeWebhookController = container.resolve(StripeWebhookController);

router.post('/checkout-session', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  moviePassController.createCheckoutSession(req, res, next),
);
router.get('/movie-pass', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  moviePassController.getMoviePass(req, res, next),
);
router.get('/history', verifyAccessToken, authorizeRoles(['user']), (req, res, next) =>
  moviePassController.findMoviePassHistory(req, res, next),
);
router.post('/webhook', (req, res, next) => stripeWebhookController.handleWebhook(req, res, next));

export default router;
