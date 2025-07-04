import 'reflect-metadata';
import { createServer } from 'http';
import app from './app';
import { connectDB } from './infrastructure/database/mongoose';
import { env } from './config/env.config';
import { SuccessMsg } from './utils/constants/commonSuccessMsg.constants';
import { initializeAgenda } from './infrastructure/agenda';
import ERROR_MESSAGES from './utils/constants/commonErrorMsg.constants';
import { socketService } from './infrastructure/services/socket.service';
import { container } from './infrastructure/container'; // Keep for other DI services

const PORT = env.PORT;

const startServer = async () => {
  try {


    await connectDB();

    await initializeAgenda();

    const server = createServer(app);
    socketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`${SuccessMsg.SERVER_RUNNING} ${PORT} 🚀`);
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.NETWORK.FAILED_TO_START_SERVER, error);
    process.exit(1);
  }
};

startServer();