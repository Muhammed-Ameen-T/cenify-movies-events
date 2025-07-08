import 'reflect-metadata';
import app from './app';
import { connectDB } from './infrastructure/database/mongoose';
import { env } from './config/env.config';
import { SuccessMsg } from './utils/constants/commonSuccessMsg.constants';

const PORT = env.PORT;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`${SuccessMsg.SERVER_RUNNING} ${PORT} 🚀`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
