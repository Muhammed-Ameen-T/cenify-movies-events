import express from 'express';
import { container } from 'tsyringe';
import { BookingStripeWebhookController } from '../controllers/bookingStripeWebhook.controller';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { IBookingMngController } from '../controllers/interface/bookingMng.controller.interface';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = express.Router();
const bookingController = container.resolve<IBookingMngController>('BookingMngController');
const stripeController = container.resolve(BookingStripeWebhookController);

router.post('/create', verifyAccessToken,authorizeRoles(['user']), (req, res, next) => bookingController.createBooking(req, res, next));
router.get('/check-payment-options', verifyAccessToken,authorizeRoles(['user']), (req, res, next) =>
  bookingController.checkPaymentOptions(req, res, next),
);
router.get('/fetch', verifyAccessToken,authorizeRoles(['user','admin']),(req, res, next) => bookingController.fetchBookings(req, res, next));
router.get('/fetch-vendor',verifyAccessToken,authorizeRoles(['vendor']), (req, res, next) =>
  bookingController.findBookingsOfVendor(req, res, next),
);
router.get('/find/:id',(req, res, next) => bookingController.findBookingById(req, res, next));
router.patch('/cancel/:id',verifyAccessToken,authorizeRoles(['user']), (req, res, next) =>
  bookingController.cancelBooking(req, res, next),
);
router.get('/user-bookings',verifyAccessToken,authorizeRoles(['user']), (req, res, next) =>
  bookingController.findBookingsOfUser(req, res, next),
);
router.post('/webhook/stripe',(req, res, next) => stripeController.handleWebhook(req, res, next));

export default router;
