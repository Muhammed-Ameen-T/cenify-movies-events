import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { requestLogger } from './presentation/middleware/logger.middleware';
import './infrastructure/container';
import 'tsconfig-paths/register';
import { container } from './infrastructure/container';   

// 🔹 Load environment variables
dotenv.config();

// 🔹 Initialize Express app
const app = express();

// 🔹 Middleware setup;
app.use('/api/movie-pass/webhook', express.raw({ type: 'application/json' }));
app.post('/api/booking/webhook/stripe', express.raw({ type: 'application/json' }));

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://your-image-server.com',
      'https://lh3.googleusercontent.com',
      'https://res.cloudinary.com',
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());


// app.use(
//   helmet({
//     crossOriginOpenerPolicy: { policy: "unsafe-none" },
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     crossOriginEmbedderPolicy: { policy: "require-corp" },
//   })
// );

// 🔹 Routes
import vendorRoutes from './presentation/routes/vendorAuth.routes';
import authRoutes from './presentation/routes/userAuth.routes';
import profileRoutes from './presentation/routes/userProfile.routes';
import adminAuthRoutes from './presentation/routes/adminAuth.routes';
import vendorMngRoutes from './presentation/routes/vendorMng.routes';
import adminMngRoutes from './presentation/routes/adminMng.routes';
import seatLayoutRoutes from './presentation/routes/seatMng.routes';
import screenMngRoutes from './presentation/routes/screenMng.routes';
import showMngRoutes from './presentation/routes/showMng.routes';
import movieMngRoutes from './presentation/routes/movieMng.routes';
import moviePassRoutes from './presentation/routes/moviePass.routes';
import seatSelectionRoutes from './presentation/routes/seatSelection.routes';
import bookingRoutes from './presentation/routes/booking.routes';
import notificationRoutes from './presentation/routes/notification.routes';
import dashboardRoutes from './presentation/routes/dashboard.routes';
import theaterRoutes from './presentation/routes/theaterMng.routes';

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/vendor', vendorMngRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminMngRoutes);
app.use('/api/vendor', seatLayoutRoutes);
app.use('/api/theater', theaterRoutes);
app.use('/api/screen', screenMngRoutes);
app.use('/api/show', showMngRoutes);
app.use('/api/movie', movieMngRoutes);
app.use('/api/movie-pass', moviePassRoutes);
app.use('/api/seat-selection', seatSelectionRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use(requestLogger);

export default app;
