"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_middleware_1 = require("./presentation/middleware/logger.middleware");
const errorHandler_middleware_1 = __importDefault(require("./presentation/middleware/errorHandler.middleware"));
require("./infrastructure/container");
require("tsconfig-paths/register");
// 🔹 Load environment variables
dotenv_1.default.config();
// 🔹 Initialize Express app
const app = (0, express_1.default)();
// 🔹 Middleware setup;
app.use('/api/movie-pass/webhook', express_1.default.raw({ type: 'application/json' }));
app.post('/api/booking/webhook/stripe', express_1.default.raw({ type: 'application/json' }));
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'https://your-image-server.com',
        'https://lh3.googleusercontent.com',
        'https://res.cloudinary.com',
    ],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// 🔹 Routes
const vendorAuth_routes_1 = __importDefault(require("./presentation/routes/vendorAuth.routes"));
const userAuth_routes_1 = __importDefault(require("./presentation/routes/userAuth.routes"));
const userProfile_routes_1 = __importDefault(require("./presentation/routes/userProfile.routes"));
const adminAuth_routes_1 = __importDefault(require("./presentation/routes/adminAuth.routes"));
const adminMng_routes_1 = __importDefault(require("./presentation/routes/adminMng.routes"));
const seatMng_routes_1 = __importDefault(require("./presentation/routes/seatMng.routes"));
const screenMng_routes_1 = __importDefault(require("./presentation/routes/screenMng.routes"));
const showMng_routes_1 = __importDefault(require("./presentation/routes/showMng.routes"));
const movieMng_routes_1 = __importDefault(require("./presentation/routes/movieMng.routes"));
const moviePass_routes_1 = __importDefault(require("./presentation/routes/moviePass.routes"));
const seatSelection_routes_1 = __importDefault(require("./presentation/routes/seatSelection.routes"));
const booking_routes_1 = __importDefault(require("./presentation/routes/booking.routes"));
const notification_routes_1 = __importDefault(require("./presentation/routes/notification.routes"));
const dashboard_routes_1 = __importDefault(require("./presentation/routes/dashboard.routes"));
const theaterMng_routes_1 = __importDefault(require("./presentation/routes/theaterMng.routes"));
app.use('/api/auth', userAuth_routes_1.default);
app.use('/api/profile', userProfile_routes_1.default);
app.use('/api/auth/admin', adminAuth_routes_1.default);
app.use('/api/vendor', vendorAuth_routes_1.default);
app.use('/api/admin', adminMng_routes_1.default);
app.use('/api/vendor', seatMng_routes_1.default);
app.use('/api/theater', theaterMng_routes_1.default);
app.use('/api/screen', screenMng_routes_1.default);
app.use('/api/show', showMng_routes_1.default);
app.use('/api/movie', movieMng_routes_1.default);
app.use('/api/movie-pass', moviePass_routes_1.default);
app.use('/api/seat-selection', seatSelection_routes_1.default);
app.use('/api/booking', booking_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use(errorHandler_middleware_1.default);
app.use(logger_middleware_1.requestLogger);
exports.default = app;
