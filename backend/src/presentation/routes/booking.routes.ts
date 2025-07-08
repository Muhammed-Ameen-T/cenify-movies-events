import express from 'express';
import { container } from 'tsyringe';
import { BookingStripeWebhookController } from '../controllers/bookingStripeWebhook.controller';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { IBookingMngController } from '../controllers/interface/bookingMng.controller.interface';

const router = express.Router();
const bookingController = container.resolve<IBookingMngController>('BookingMngController');
const stripeController = container.resolve(BookingStripeWebhookController);

router.post('/create', verifyAccessToken, (req, res) => bookingController.createBooking(req, res));
router.get('/check-payment-options', verifyAccessToken, (req, res) =>
  bookingController.checkPaymentOptions(req, res),
);
router.get('/fetch', verifyAccessToken, (req, res) => bookingController.fetchBookings(req, res));
router.get('/fetch-vendor', verifyAccessToken, (req, res) =>
  bookingController.findBookingsOfVendor(req, res),
);
router.get('/find/:id', (req, res) => bookingController.findBookingById(req, res));
router.patch('/cancel/:id', verifyAccessToken, (req, res) =>
  bookingController.cancelBooking(req, res),
);
router.get('/user-bookings', verifyAccessToken, (req, res) =>
  bookingController.findBookingsOfUser(req, res),
);
router.post('/webhook/stripe', (req, res) => stripeController.handleWebhook(req, res));

export default router;
