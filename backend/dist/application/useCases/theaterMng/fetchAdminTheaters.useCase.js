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
exports.FetchAdminTheatersUseCase = void 0;
// src/domain/useCases/FetchTheatersUseCase.ts
const tsyringe_1 = require("tsyringe");
const vendor_dto_1 = require("../../dtos/vendor.dto");
let FetchAdminTheatersUseCase = class FetchAdminTheatersUseCase {
    constructor(theaterRepository) {
        this.theaterRepository = theaterRepository;
    }
    async execute(params = {}) {
        try {
            const { theaters, totalCount } = await this.theaterRepository.findAdminTheaters(params);
            return {
                theaters: theaters.map((theater) => this.mapToDTO(theater)),
                totalCount,
            };
        }
        catch (error) {
            console.error('Error fetching theaters:', error);
            throw new Error('Failed to retrieve theaters');
        }
    }
    mapToDTO(theater) {
        const vendor = theater.vendorId;
        return new vendor_dto_1.TheaterResponseDTO(theater._id.toString(), theater.name, theater.status, theater.location, theater.facilities, theater.intervalTime, theater.gallery, theater.email, theater.phone, theater.rating, theater.ratingCount, theater.description, vendor
            ? {
                id: vendor._id.toString(),
                name: vendor.name,
                email: vendor.email,
                phone: vendor.phone,
            }
            : null, theater.createdAt, theater.updatedAt);
    }
};
exports.FetchAdminTheatersUseCase = FetchAdminTheatersUseCase;
exports.FetchAdminTheatersUseCase = FetchAdminTheatersUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object])
], FetchAdminTheatersUseCase);
