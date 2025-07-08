import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure logging directory exists
const logDir = path.join(__dirname, '../../logging');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    logFormat,
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'All_Logs-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
    new DailyRotateFile({
      filename: path.join(logDir, 'Errors-%DATE%.log'),
      datePattern: 'DD-MM-YYYY',
      maxSize: '10m',
      maxFiles: '30d',
      level: 'error',
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export default logger;
