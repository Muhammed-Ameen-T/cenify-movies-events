import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { requestLogger } from './presentation/middleware/logger.middleware';
import './infrastructure/container';
import 'tsconfig-paths/register';

// 🔹 Load environment variables
dotenv.config();

// 🔹 Initialize Express app
const app = express();

// 🔹 Middleware setup;
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-image-server.com',
    'https://lh3.googleusercontent.com',
    'https://res.cloudinary.com' 
  ],
  credentials: true,
}));


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
import vendorMngRoutes from './presentation/routes/vendorMng.routes'
import adminMngRoutes from './presentation/routes/adminMng.routes'
import seatLayoutRoutes from './presentation/routes/seatMng.routes'
import screenMngRoutes from './presentation/routes/screenMng.routes';
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth/admin', adminAuthRoutes);
app.use('/api/vendor', vendorMngRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin',adminMngRoutes)
app.use('/api/vendor',seatLayoutRoutes)
app.use('/api/screen', screenMngRoutes);

app.use(requestLogger);

export default app;