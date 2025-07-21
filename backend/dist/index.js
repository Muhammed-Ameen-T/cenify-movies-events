"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = require("./infrastructure/database/mongoose");
const env_config_1 = require("./config/env.config");
const commonSuccessMsg_constants_1 = require("./utils/constants/commonSuccessMsg.constants");
const agenda_1 = require("./infrastructure/agenda");
const commonErrorMsg_constants_1 = __importDefault(require("./utils/constants/commonErrorMsg.constants"));
const socket_service_1 = require("./infrastructure/services/socket.service");
const PORT = env_config_1.env.PORT;
const startServer = async () => {
    try {
        await (0, mongoose_1.connectDB)();
        await (0, agenda_1.initializeAgenda)();
        const server = (0, http_1.createServer)(app_1.default);
        socket_service_1.socketService.initialize(server);
        server.listen(PORT, () => {
            console.log(`${commonSuccessMsg_constants_1.SuccessMsg.SERVER_RUNNING} ${PORT} 🚀`);
        });
    }
    catch (error) {
        console.error(commonErrorMsg_constants_1.default.NETWORK.FAILED_TO_START_SERVER, error);
        process.exit(1);
    }
};
startServer();
