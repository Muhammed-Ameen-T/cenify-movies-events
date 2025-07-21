"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowJobService = void 0;
const tsyringe_1 = require("tsyringe");
const agenda_1 = __importDefault(require("agenda"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const env_config_1 = require("../../config/env.config");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
let ShowJobService = class ShowJobService {
    constructor(showRepository, cancelBooking, bookingRepository) {
        this.showRepository = showRepository;
        this.cancelBooking = cancelBooking;
        this.bookingRepository = bookingRepository;
        // Initialize Agenda with MongoDB connection
        this.agenda = new agenda_1.default({
            db: {
                address: env_config_1.env.MONGO_URI,
                collection: 'agendaJobs',
            },
            processEvery: '1 minute',
            maxConcurrency: 10,
        });
        // Define jobs
        this.defineJobs();
    }
    defineJobs() {
        // Job to set show status to Running
        this.agenda.define('startShow', async (job) => {
            const { showId } = job.attrs.data;
            try {
                const show = await this.showRepository.findById(showId);
                if (!show) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                if (show.status === 'Scheduled') {
                    await this.showRepository.updateStatus(showId, 'Running');
                    console.log(`✅ Show ${showId} status updated to Running`);
                }
            }
            catch (error) {
                console.error(`❌ Error starting show ${showId}:`, error);
                throw error;
            }
        });
        // Job to set show status to Completed
        this.agenda.define('completeShow', async (job) => {
            const { showId } = job.attrs.data;
            try {
                const show = await this.showRepository.findById(showId);
                if (!show) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                if (show.status === 'Running') {
                    await this.showRepository.updateStatus(showId, 'Completed');
                    await this.showRepository.creditRevenueToWallet(showId);
                    console.log(`✅ Show ${showId} status updated to Completed`);
                }
            }
            catch (error) {
                console.error(`❌ Error completing show ${showId}:`, error);
                throw error;
            }
        });
        // Job to release expired pending seats
        this.agenda.define('releaseExpiredSeats', async (job) => {
            const { showId } = job.attrs.data;
            try {
                await this.showRepository.pullExpiredSeats(showId);
                console.log(`✅ Expired pending seats removed for showId: ${showId}`);
            }
            catch (error) {
                console.error(`❌ Error releasing expired pending seats for showId: ${showId}`, error);
                throw error;
            }
        });
        this.agenda.define('cancelPendingBooking', async (job) => {
            const { bookingId } = job.attrs.data;
            try {
                console.log(`🔍 Validating booking ${bookingId} for cancellation`);
                const booking = await this.bookingRepository.findByBookingId(bookingId);
                if (!booking) {
                    throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
                }
                if (booking.payment.status === 'pending' && booking.status !== 'cancelled') {
                    await this.cancelBooking.execute(bookingId, 'Payment not completed within time period');
                    console.log(`🚫 Booking ${bookingId} auto-cancelled due to pending payment`);
                }
                else {
                    console.log(`✅ Booking ${bookingId} payment status: ${booking.payment.status}, skipping cancellation.`);
                }
            }
            catch (error) {
                console.error(`❌ Error cancelling booking ${bookingId}:`, error);
            }
        });
    }
    async scheduleShowJobs(showId, startTime, endTime) {
        try {
            await this.cancelShowJobs(showId);
            await this.agenda.schedule(startTime, 'startShow', { showId });
            console.log(`✅ Scheduled startShow job for showId: ${showId} at ${startTime}`);
            if (endTime) {
                await this.agenda.schedule(endTime, 'completeShow', { showId });
                console.log(`✅ Scheduled completeShow job for showId: ${showId} at ${endTime}`);
            }
        }
        catch (error) {
            console.error(`❌ Error scheduling show jobs for showId: ${showId}`, error);
            throw new custom_error_1.CustomError('Failed to schedule show jobs', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async scheduleSeatExpiration(showId) {
        try {
            await this.agenda.schedule(new Date(Date.now() + 5 * 60 * 1000), 'releaseExpiredSeats', {
                showId,
            });
            console.log(`✅ Scheduled releaseExpiredSeats job for showId: ${showId} to run in 5 minutes`);
        }
        catch (error) {
            console.error(`❌ Error scheduling seat expiration job for showId: ${showId}`, error);
            throw new custom_error_1.CustomError('Failed to schedule seat expiration job', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelShowJobs(showId) {
        try {
            await this.agenda.cancel({ 'data.showId': showId });
            console.log(`✅ Cancelled existing jobs for showId: ${showId}`);
        }
        catch (error) {
            console.error(`❌ Error cancelling jobs for showId: ${showId}`, error);
            throw new custom_error_1.CustomError('Failed to cancel show jobs', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async scheduleBookingAutoCancel(bookingId) {
        try {
            await this.agenda.schedule(new Date(Date.now() + 10 * 60 * 1000), 'cancelPendingBooking', {
                bookingId,
            });
            console.log(`✅ Scheduled cancelPendingBooking job for bookingId: ${bookingId} to run in 10 minutes`);
        }
        catch (error) {
            console.error(`❌ Error scheduling cancelPendingBooking job for bookingId: ${bookingId}`, error);
            throw new custom_error_1.CustomError('Failed to schedule booking auto-cancel job', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async startAgenda() {
        try {
            await this.agenda.start();
            console.log(commonSuccessMsg_constants_1.SuccessMsg.AGENDA_STARTED);
        }
        catch (error) {
            console.error(commonErrorMsg_constants_1.default.GENERAL.FAILED_START_AGENDA, error);
            throw new custom_error_1.CustomError('Failed to start Agenda scheduler', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ShowJobService = ShowJobService;
exports.ShowJobService = ShowJobService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ShowRepository')),
    __param(1, (0, tsyringe_1.inject)('CancelBookingUseCase')),
    __param(2, (0, tsyringe_1.inject)('BookingRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ShowJobService);
