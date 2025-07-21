"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure logging directory exists
const logDir = path_1.default.join(__dirname, '../../logging');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Log format
const logFormat = winston_1.default.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});
// Create logger instance
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), logFormat),
    transports: [
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'All_Logs-%DATE%.log'),
            datePattern: 'DD-MM-YYYY',
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info',
        }),
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDir, 'Errors-%DATE%.log'),
            datePattern: 'DD-MM-YYYY',
            maxSize: '10m',
            maxFiles: '30d',
            level: 'error',
        }),
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
    ],
});
exports.default = logger;
