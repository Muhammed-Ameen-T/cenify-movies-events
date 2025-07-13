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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMoviePassUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const moviePass_entity_1 = require("../../../domain/entities/moviePass.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const moviePass_service_1 = require("../../../infrastructure/services/moviePass.service");
const socket_service_1 = require("../../../infrastructure/services/socket.service");
let CreateMoviePassUseCase = class CreateMoviePassUseCase {
    constructor(moviePassRepository, userRepository, notificationRepository, moviePassJobService) {
        this.moviePassRepository = moviePassRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.moviePassJobService = moviePassJobService;
    }
    async execute(dto) {
        // Check if user exists
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new custom_error_1.CustomError('User not found', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        // Check if Movie Pass exists
        let moviePass = await this.moviePassRepository.findByUserId(dto.userId);
        if (moviePass) {
            // Update existing Movie Pass
            moviePass = await this.moviePassRepository.update(moviePass._id, {
                status: 'Active',
                purchaseDate: dto.purchaseDate,
                expireDate: dto.expireDate,
                moneySaved: moviePass.moneySaved,
                totalMovies: moviePass.totalMovies,
                history: moviePass.history,
            });
            if (!moviePass) {
                throw new custom_error_1.CustomError('Failed to update Movie Pass', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
        }
        else {
            // Create new Movie Pass
            const newMoviePass = new moviePass_entity_1.MoviePass(null, dto.userId, 'Active', [], dto.purchaseDate, dto.expireDate, 0, 0);
            moviePass = await this.moviePassRepository.create(newMoviePass);
        }
        // Update user document
        await this.userRepository.updateMoviePass(dto.userId, {
            moviePass: {
                buyDate: dto.purchaseDate,
                expiryDate: dto.expireDate,
                isPass: true,
            },
        });
        // Send notification
        const notification = new notification_entity_1.Notification(null, dto.userId, 'Movie Pass Purchased', 'MoviePass', 'Your Movie Pass has been successfully activated!', null, new Date(), new Date(), false, false, []);
        await this.notificationRepository.createNotification(notification);
        socket_service_1.socketService.emitNotification(`user-${dto.userId}`, notification);
        // Schedule expiration job
        await this.moviePassJobService.scheduleMoviePassExpiration(dto.userId, dto.expireDate);
        return moviePass;
    }
};
exports.CreateMoviePassUseCase = CreateMoviePassUseCase;
exports.CreateMoviePassUseCase = CreateMoviePassUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('MoviePassRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __param(2, (0, tsyringe_1.inject)('NotificationRepository')),
    __param(3, (0, tsyringe_1.inject)('MoviePassJobService')),
    __metadata("design:paramtypes", [Object, Object, Object, moviePass_service_1.MoviePassJobService])
], CreateMoviePassUseCase);
