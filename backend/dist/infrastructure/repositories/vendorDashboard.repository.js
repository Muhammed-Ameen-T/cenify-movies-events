"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const booking_model_1 = __importDefault(require("../database/booking.model"));
const show_model_1 = __importDefault(require("../database/show.model"));
const theater_model_1 = require("../database/theater.model");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const user_model_1 = require("../database/user.model");
class DashboardRepository {
    async getDashboardData(vendorId, params) {
        try {
            const { startDate, endDate, status, location } = params;
            const vendorObjectId = new mongoose_1.Types.ObjectId(vendorId);
            // Validate vendor
            const vendor = await user_model_1.UserModel.findOne({ _id: vendorObjectId, role: 'vendor' }).lean();
            if (!vendor) {
                throw new Error(commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            }
            // Get vendor's theater IDs
            const theaterMatch = { vendorId: vendorObjectId };
            if (status)
                theaterMatch.status = status;
            if (location)
                theaterMatch['location.city'] = new RegExp(location, 'i');
            const theaters = await theater_model_1.TheaterModel.find(theaterMatch).select('_id').lean();
            const theaterIds = theaters.map((t) => new mongoose_1.default.Types.ObjectId(t._id));
            console.log('Theater IDs:', theaterIds); // Debug log
            // Get vendor's show IDs
            const showMatch = { vendorId: vendorObjectId, theaterId: { $in: theaterIds } };
            const shows = await show_model_1.default.find(showMatch).select('_id').lean();
            const showIds = shows.map((s) => s._id);
            console.log('Show IDs:', showIds); // Debug log
            // Base booking match
            const bookingMatch = {
                showId: { $in: showIds },
                status: 'confirmed',
                'payment.status': 'completed',
            };
            if (startDate)
                bookingMatch.createdAt = { $gte: new Date(startDate) };
            if (endDate)
                bookingMatch.createdAt = { ...bookingMatch.createdAt, $lte: new Date(endDate) };
            console.log('Booking Match:', bookingMatch); // Debug log
            // Fetch all data in parallel
            const [statistics, monthlyRevenue, occupancyRate, topSellingShows, topTheaters] = await Promise.all([
                this.getStatistics(bookingMatch, theaterIds, vendorId),
                this.getMonthlyRevenue(bookingMatch),
                this.getOccupancyRates(theaterIds, bookingMatch),
                this.getTopSellingShows(bookingMatch),
                this.getTopTheaters(theaterIds, bookingMatch),
            ]);
            return {
                statistics,
                monthlyRevenue,
                occupancyRate,
                topSellingShows,
                topTheaters,
            };
        }
        catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_DASHBOARD);
        }
    }
    async getStatistics(bookingMatch, theaterIds, vendorId) {
        // Total Revenue and Tickets Sold
        const bookingStats = await booking_model_1.default.aggregate([
            { $match: bookingMatch },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalAmount' },
                    ticketsSold: { $sum: { $size: '$bookedSeatsId' } },
                },
            },
        ]);
        // Active Shows
        const activeShowMatch = {
            vendorId: new mongoose_1.Types.ObjectId(vendorId),
            theaterId: { $in: theaterIds },
            status: { $in: ['Scheduled', 'Running'] },
        };
        const activeShows = await show_model_1.default.countDocuments(activeShowMatch);
        // Average Occupancy
        const occupancyStats = await booking_model_1.default.aggregate([
            { $match: bookingMatch },
            {
                $lookup: {
                    from: 'shows',
                    localField: 'showId',
                    foreignField: '_id',
                    as: 'show',
                },
            },
            { $unwind: '$show' },
            {
                $lookup: {
                    from: 'screens',
                    localField: 'show.screenId',
                    foreignField: '_id',
                    as: 'screen',
                },
            },
            { $unwind: '$screen' },
            {
                $lookup: {
                    from: 'seatlayouts',
                    localField: 'screen.seatLayoutId',
                    foreignField: '_id',
                    as: 'seatLayout',
                },
            },
            { $unwind: '$seatLayout' },
            {
                $group: {
                    _id: null,
                    totalSeats: { $sum: '$seatLayout.capacity' },
                    bookedSeats: { $sum: { $size: '$bookedSeatsId' } },
                },
            },
            {
                $project: {
                    averageOccupancy: {
                        $cond: [
                            { $eq: ['$totalSeats', 0] },
                            0,
                            { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
                        ],
                    },
                },
            },
        ]);
        return {
            totalRevenue: bookingStats[0]?.totalRevenue || 0,
            ticketsSold: bookingStats[0]?.ticketsSold || 0,
            activeShows,
            averageOccupancy: occupancyStats[0]?.averageOccupancy || 0,
        };
    }
    async getMonthlyRevenue(bookingMatch) {
        return booking_model_1.default.aggregate([
            { $match: bookingMatch },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    value: { $sum: '$totalAmount' },
                },
            },
            {
                $project: {
                    name: {
                        $dateToString: {
                            format: '%b',
                            date: { $dateFromString: { dateString: '$_id' } },
                        },
                    },
                    value: 1,
                },
            },
            { $sort: { _id: 1 } },
        ]);
    }
    async getOccupancyRates(theaterIds, bookingMatch) {
        if (!theaterIds.length) {
            console.warn('No theater IDs provided for occupancy rates');
            return [];
        }
        return booking_model_1.default.aggregate([
            { $match: bookingMatch }, // Match bookings first
            {
                $lookup: {
                    from: 'shows',
                    localField: 'showId',
                    foreignField: '_id',
                    as: 'show',
                },
            },
            { $unwind: { path: '$show', preserveNullAndEmptyArrays: true } },
            {
                $match: { 'show.theaterId': { $in: theaterIds } }, // Apply theaterId filter after lookup
            },
            {
                $lookup: {
                    from: 'screens',
                    localField: 'show.screenId',
                    foreignField: '_id',
                    as: 'screen',
                },
            },
            { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'seatlayouts',
                    localField: 'screen.seatLayoutId',
                    foreignField: '_id',
                    as: 'seatLayout',
                },
            },
            { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'theaters',
                    localField: 'show.theaterId',
                    foreignField: '_id',
                    as: 'theater',
                },
            },
            { $unwind: { path: '$theater', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$theater._id',
                    name: { $first: '$theater.name' },
                    totalSeats: { $sum: { $ifNull: ['$seatLayout.capacity', 0] } },
                    bookedSeats: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
                },
            },
            {
                $project: {
                    name: 1,
                    rate: {
                        $cond: [
                            { $eq: ['$totalSeats', 0] },
                            0,
                            { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
                        ],
                    },
                },
            },
            { $sort: { rate: -1 } }, // Sort by occupancy rate
        ]);
    }
    async getTopSellingShows(bookingMatch) {
        return booking_model_1.default.aggregate([
            { $match: bookingMatch },
            {
                $lookup: {
                    from: 'shows',
                    localField: 'showId',
                    foreignField: '_id',
                    as: 'show',
                },
            },
            { $unwind: '$show' },
            {
                $lookup: {
                    from: 'movies',
                    localField: 'show.movieId',
                    foreignField: '_id',
                    as: 'movie',
                },
            },
            { $unwind: '$movie' },
            {
                $group: {
                    _id: '$show._id',
                    title: { $first: '$movie.name' },
                    tickets: { $sum: { $size: '$bookedSeatsId' } },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { tickets: -1 } },
            { $limit: 4 },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    tickets: 1,
                    revenue: 1,
                },
            },
        ]);
    }
    async getTopTheaters(theaterIds, bookingMatch) {
        if (!theaterIds.length) {
            console.warn('No theater IDs provided for top theaters');
            return [];
        }
        return booking_model_1.default.aggregate([
            { $match: bookingMatch }, // Match bookings first
            {
                $lookup: {
                    from: 'shows',
                    localField: 'showId',
                    foreignField: '_id',
                    as: 'show',
                },
            },
            { $unwind: { path: '$show', preserveNullAndEmptyArrays: true } },
            {
                $match: { 'show.theaterId': { $in: theaterIds } }, // Apply theaterId filter after lookup
            },
            {
                $lookup: {
                    from: 'screens',
                    localField: 'show.screenId',
                    foreignField: '_id',
                    as: 'screen',
                },
            },
            { $unwind: { path: '$screen', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'seatlayouts',
                    localField: 'screen.seatLayoutId',
                    foreignField: '_id',
                    as: 'seatLayout',
                },
            },
            { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'theaters',
                    localField: 'show.theaterId',
                    foreignField: '_id',
                    as: 'theater',
                },
            },
            { $unwind: { path: '$theater', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$theater._id',
                    name: { $first: '$theater.name' },
                    tickets: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
                    revenue: { $sum: '$totalAmount' },
                    totalSeats: { $sum: { $ifNull: ['$seatLayout.capacity', 0] } },
                    bookedSeats: { $sum: { $size: { $ifNull: ['$bookedSeatsId', []] } } },
                },
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    tickets: 1,
                    revenue: 1,
                    occupancyRate: {
                        $cond: [
                            { $eq: ['$totalSeats', 0] },
                            0,
                            { $multiply: [{ $divide: ['$bookedSeats', '$totalSeats'] }, 100] },
                        ],
                    },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
        ]);
    }
}
exports.DashboardRepository = DashboardRepository;
