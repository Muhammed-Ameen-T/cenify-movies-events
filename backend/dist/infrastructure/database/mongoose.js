"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const env_config_1 = require("../../config/env.config");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
dotenv_1.default.config();
const MONGO_URI = env_config_1.env.MONGO_URI;
/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Loads the database URI from environment variables.
 *
 * @returns {Promise<void>} Resolves when the database is successfully connected.
 * @throws {Error} Logs an error and terminates the process if connection fails.
 */
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI, {
            autoIndex: true,
        });
        console.log(commonSuccessMsg_constants_1.SuccessMsg.DATABASE_CONNECTED);
    }
    catch (error) {
        console.error(commonErrorMsg_constants_1.default.DATABASE.CONNECTION_FAILED, error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
