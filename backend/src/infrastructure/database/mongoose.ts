import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { env } from '../../config/env.config';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

dotenv.config();

const MONGO_URI = env.MONGO_URI;

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Loads the database URI from environment variables.
 *
 * @returns {Promise<void>} Resolves when the database is successfully connected.
 * @throws {Error} Logs an error and terminates the process if connection fails.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGO_URI, {
      autoIndex: true,
    });
    console.log(SuccessMsg.DATABASE_CONNECTED);
  } catch (error) {
    console.error(ERROR_MESSAGES.DATABASE.CONNECTION_FAILED, error);
    process.exit(1);
  }
};
