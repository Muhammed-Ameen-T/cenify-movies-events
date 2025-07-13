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
exports.MoviePassJobService = void 0;
const tsyringe_1 = require("tsyringe");
const agenda_1 = __importDefault(require("agenda"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const env_config_1 = require("../../config/env.config");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
let MoviePassJobService = class MoviePassJobService {
    constructor(moviePassRepository, userRepository) {
        this.moviePassRepository = moviePassRepository;
        this.userRepository = userRepository;
        this.agenda = new agenda_1.default({
            db: {
                address: env_config_1.env.MONGO_URI,
                collection: 'agendaJobs',
            },
            processEvery: '1 minute',
            maxConcurrency: 10,
        });
        this.defineJobs();
    }
    defineJobs() {
        this.agenda.define('expireMoviePass', async (job) => {
            const { userId } = job.attrs.data;
            try {
                const moviePass = await this.moviePassRepository.findByUserId(userId);
                if (!moviePass) {
                    throw new custom_error_1.CustomError('Movie Pass not found', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                if (moviePass.status === 'Active') {
                    await this.moviePassRepository.updateStatus(userId, 'Inactive');
                    await this.userRepository.updateMoviePass(userId, {
                        moviePass: {
                            buyDate: null,
                            expiryDate: null,
                            isPass: false,
                        },
                    });
                    console.log(`✅ MoviePassJobService ~ expireMoviePass ~ Movie Pass for user ${userId} set to Inactive`);
                }
                else {
                    console.log(`⚠️ MoviePassJobService ~ expireMoviePass ~ Movie Pass for user ${userId} is already ${moviePass.status}`);
                }
            }
            catch (error) {
                console.error(`❌ MoviePassJobService ~ expireMoviePass ~ Error for userId: ${userId}`, error);
                throw error;
            }
        });
    }
    async scheduleMoviePassExpiration(userId, expireDate) {
        try {
            await this.cancelMoviePassJobs(userId);
            await this.agenda.schedule(expireDate, 'expireMoviePass', { userId });
            console.log(`✅ MoviePassJobService ~ scheduleMoviePassExpiration ~ Scheduled expiration for userId: ${userId} at ${expireDate}`);
        }
        catch (error) {
            console.error(`❌ MoviePassJobService ~ scheduleMoviePassExpiration ~ Error scheduling job for userId: ${userId}`, error);
            throw new custom_error_1.CustomError('Failed to schedule Movie Pass expiration', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async cancelMoviePassJobs(userId) {
        try {
            await this.agenda.cancel({ 'data.userId': userId });
            console.log(`✅ MoviePassJobService ~ cancelMoviePassJobs ~ Cancelled existing jobs for userId: ${userId}`);
        }
        catch (error) {
            console.error(`❌ MoviePassJobService ~ cancelMoviePassJobs ~ Error cancelling jobs for userId: ${userId}`, error);
            throw new custom_error_1.CustomError('Failed to cancel Movie Pass jobs', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async startAgenda() {
        try {
            await this.agenda.start();
            console.log(commonSuccessMsg_constants_1.SuccessMsg.AGENDA_STARTED);
        }
        catch (error) {
            console.error('Failed to start Agenda scheduler', error);
            throw new custom_error_1.CustomError('Failed to start Agenda scheduler', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MoviePassJobService = MoviePassJobService;
exports.MoviePassJobService = MoviePassJobService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('MoviePassRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], MoviePassJobService);
