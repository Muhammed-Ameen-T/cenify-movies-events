import { Router } from 'express';
import { container } from 'tsyringe';
import { MoviePassController } from '../controllers/moviePass.controller';
import { StripeWebhookController } from '../controllers/stripeWebhook.controller';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';

const router = Router();
const moviePassController = container.resolve(MoviePassController);
const stripeWebhookController = container.resolve(StripeWebhookController);

router.post('/checkout-session', verifyAccessToken, (req, res) =>
  moviePassController.createCheckoutSession(req, res),
);
router.get('/movie-pass', verifyAccessToken, (req, res) =>
  moviePassController.getMoviePass(req, res),
);
router.get('/history', verifyAccessToken, (req, res) =>
  moviePassController.findMoviePassHistory(req, res),
);
router.post('/webhook', (req, res) => stripeWebhookController.handleWebhook(req, res));

export default router;
