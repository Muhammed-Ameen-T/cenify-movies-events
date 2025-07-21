"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardRepository = void 0;
const booking_model_1 = __importDefault(require("../database/booking.model"));
const show_model_1 = __importDefault(require("../database/show.model"));
const theater_model_1 = require("../database/theater.model");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const user_model_1 = require("../database/user.model");
class AdminDashboardRepository {
    async getDashboardData(adminId, params) {
        try {
            const admin = await user_model_1.UserModel.findOne({ _id: adminId, role: 'admin' }).lean();
            if (!admin) {
                throw new Error(commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            }
            const { period = 'monthly', startDate, endDate, location } = params;
            // Base booking match
            const bookingMatch = { status: 'confirmed', 'payment.status': 'completed' };
            if (startDate)
                bookingMatch.createdAt = { $gte: new Date(startDate) };
            if (endDate)
                bookingMatch.createdAt = { ...bookingMatch.createdAt, $lte: new Date(endDate) };
            // Theater match
            const theaterMatch = {};
            if (location)
                theaterMatch['location.city'] = new RegExp(location, 'i');
            // Fetch data in parallel
            const [statistics, sales, topTheaters, topShows, theaterStatus] = await Promise.all([
                this.getStatistics(bookingMatch, theaterMatch, period), // Pass period
                this.getSalesData(bookingMatch, period),
                this.getTopTheaters(bookingMatch, theaterMatch, period),
                this.getTopShows(bookingMatch),
                this.getTheaterStatus(theaterMatch),
            ]);
            return {
                statistics,
                sales,
                topTheaters,
                topShows,
                theaterStatus,
            };
        }
        catch (error) {
            console.error('❌ Error fetching admin dashboard data:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FETCHING_DASHBOARD);
        }
    }
    async getStatistics(bookingMatch, theaterMatch, period = 'monthly') {
        let dateFormat;
        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                break;
            case 'annually':
                dateFormat = '%Y';
                break;
            default:
                dateFormat = '%Y-%m';
        }
        const [bookingStats, theaterStats] = await Promise.all([
            booking_model_1.default.aggregate([
                { $match: bookingMatch },
                {
                    $project: {
                        totalAmount: 1,
                        bookedSeatsId: 1,
                        createdAt: {
                            $dateAdd: {
                                startDate: '$createdAt',
                                unit: 'minute',
                                amount: 330, // IST offset: +5 hours 30 minutes
                            },
                        },
                    },
                },
                {
                    $group: {
                        _id: period !== 'all'
                            ? { $dateToString: { format: dateFormat, date: '$createdAt' } }
                            : null,
                        totalRevenue: { $sum: '$totalAmount' },
                        totalBookings: { $sum: { $size: '$bookedSeatsId' } },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalRevenue' },
                        totalBookings: { $sum: '$totalBookings' },
                    },
                },
            ]),
            theater_model_1.TheaterModel.aggregate([
                { $match: theaterMatch },
                {
                    $group: {
                        _id: null,
                        totalTheaters: { $sum: 1 },
                        averageRating: { $avg: '$rating' },
                    },
                },
            ]),
        ]);
        return {
            totalRevenue: bookingStats[0]?.totalRevenue || 0,
            totalBookings: bookingStats[0]?.totalBookings || 0,
            totalTheaters: theaterStats[0]?.totalTheaters || 0,
            averageRating: theaterStats[0]?.averageRating || 0,
        };
    }
    async getSalesData(bookingMatch, period) {
        let dateFormat;
        let displayFormat;
        switch (period) {
            case 'daily':
                dateFormat = '%Y-%m-%d';
                displayFormat = '%d %b %Y';
                break;
            case 'annually':
                dateFormat = '%Y';
                displayFormat = '%Y';
                break;
            default:
                dateFormat = '%Y-%m';
                displayFormat = '%b %Y';
        }
        // Adjust createdAt to IST (+5:30)
        const sales = await booking_model_1.default.aggregate([
            { $match: bookingMatch },
            {
                $project: {
                    totalAmount: 1,
                    createdAt: {
                        $dateAdd: {
                            startDate: '$createdAt',
                            unit: 'minute',
                            amount: 330, // IST offset: +5 hours 30 minutes
                        },
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            {
                $project: {
                    name: {
                        $cond: [
                            { $eq: [period, 'annually'] },
                            '$_id', // Use _id directly for annually
                            {
                                $dateToString: {
                                    format: displayFormat,
                                    date: { $dateFromString: { dateString: '$_id' } },
                                },
                            },
                        ],
                    },
                    revenue: 1,
                },
            },
            { $sort: { _id: 1 } },
        ]);
        return sales;
    }
    async getTopTheaters(bookingMatch, theaterMatch, period) {
        // Get current period revenue and bookings
        const currentStats = await booking_model_1.default.aggregate([
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
                    from: 'theaters',
                    localField: 'show.theaterId',
                    foreignField: '_id',
                    as: 'theater',
                },
            },
            { $unwind: '$theater' },
            { $match: theaterMatch },
            {
                $group: {
                    _id: '$theater._id',
                    name: { $first: '$theater.name' },
                    location: { $first: '$theater.location.city' },
                    revenue: { $sum: '$totalAmount' },
                    bookings: { $sum: { $size: '$bookedSeatsId' } },
                    rating: { $first: '$theater.rating' },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
        ]);
        // Calculate growth by comparing with previous period
        const previousBookingMatch = { ...bookingMatch };
        let previousStartDate, previousEndDate;
        const endDate = bookingMatch.createdAt?.$lte || new Date();
        const startDate = bookingMatch.createdAt?.$gte || new Date(0);
        if (period === 'daily') {
            previousEndDate = new Date(startDate);
            previousStartDate = new Date(previousEndDate);
            previousStartDate.setDate(previousStartDate.getDate() - 1);
        }
        else if (period === 'monthly') {
            previousEndDate = new Date(startDate);
            previousStartDate = new Date(previousEndDate);
            previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        }
        else {
            previousEndDate = new Date(startDate);
            previousStartDate = new Date(previousEndDate);
            previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        }
        previousBookingMatch.createdAt = {
            $gte: previousStartDate,
            $lte: previousEndDate,
        };
        const previousStats = await booking_model_1.default.aggregate([
            { $match: previousBookingMatch },
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
                    from: 'theaters',
                    localField: 'show.theaterId',
                    foreignField: '_id',
                    as: 'theater',
                },
            },
            { $unwind: '$theater' },
            { $match: theaterMatch },
            {
                $group: {
                    _id: '$theater._id',
                    previousRevenue: { $sum: '$totalAmount' },
                },
            },
        ]);
        const previousRevenueMap = new Map(previousStats.map((s) => [s._id.toString(), s.previousRevenue]));
        return currentStats.map((t, index) => {
            const previousRevenue = previousRevenueMap.get(t._id.toString()) || 0;
            const growth = previousRevenue > 0
                ? ((t.revenue - previousRevenue) / previousRevenue) * 100
                : t.revenue > 0
                    ? 100
                    : 0;
            return {
                id: t._id,
                name: t.name,
                location: t.location,
                revenue: t.revenue,
                bookings: t.bookings,
                rating: t.rating || 0,
                growth,
                rank: index + 1,
            };
        });
    }
    async getTopShows(bookingMatch) {
        // Determine hot shows (top 25% bookings in last 7 days)
        const hotThresholdDate = new Date();
        hotThresholdDate.setDate(hotThresholdDate.getDate() - 7);
        const hotShows = await booking_model_1.default.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    'payment.status': 'completed',
                    createdAt: { $gte: hotThresholdDate },
                },
            },
            {
                $group: {
                    _id: '$showId',
                    bookings: { $sum: { $size: '$bookedSeatsId' } },
                },
            },
            { $sort: { bookings: -1 } },
            { $limit: Math.ceil(0.25 * (await show_model_1.default.countDocuments())) }, // Top 25%
            {
                $group: {
                    _id: null,
                    hotShowIds: { $push: '$_id' },
                },
            },
        ]);
        const hotShowIds = hotShows[0]?.hotShowIds || [];
        // Get top shows
        const shows = await booking_model_1.default.aggregate([
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
                    genre: {
                        $first: {
                            $reduce: {
                                input: '$movie.genre',
                                initialValue: '',
                                in: {
                                    $concat: ['$$value', { $cond: [{ $eq: ['$$value', ''] }, '', ', '] }, '$$this'],
                                },
                            },
                        },
                    },
                    duration: {
                        $first: {
                            $concat: [
                                { $toString: '$movie.duration.hours' },
                                'h ',
                                { $toString: '$movie.duration.minutes' },
                                'm',
                            ],
                        },
                    },
                    rating: { $first: '$movie.rating' },
                    poster: { $first: '$movie.poster' },
                    bookings: { $sum: { $size: '$bookedSeatsId' } },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { bookings: -1 } },
            { $limit: 4 },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    genre: 1,
                    duration: 1,
                    rating: 1,
                    poster: 1,
                    bookings: 1,
                    revenue: 1,
                    isHot: { $in: ['$_id', hotShowIds] },
                },
            },
        ]);
        return shows;
    }
    async getTheaterStatus(theaterMatch) {
        const statusCounts = await theater_model_1.TheaterModel.aggregate([
            { $match: theaterMatch },
            {
                $group: {
                    _id: '$status',
                    value: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: '$_id',
                    value: 1,
                    color: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$_id', 'verified'] }, then: '#10b981' },
                                { case: { $eq: ['$_id', 'verifying'] }, then: '#f59e0b' },
                                // { case: { $eq: ['$_id', 'pending'] }, then: '#6b7280' },
                                { case: { $eq: ['$_id', 'blocked'] }, then: '#ef4444' },
                            ],
                            default: '#6b7280',
                        },
                    },
                },
            },
        ]);
        // Capitalize status names in JavaScript
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        // Ensure all statuses are included
        const statusMap = {
            Verified: '#10b981',
            Verifying: '#f59e0b',
            // Pending: '#6b7280',
            Blocked: '#ef4444',
        };
        const result = Object.keys(statusMap).map((name) => ({
            name: capitalize(name),
            value: statusCounts.find((s) => s.name.toLowerCase() === name.toLowerCase())?.value || 0,
            color: statusMap[name],
        }));
        return result;
    }
}
exports.AdminDashboardRepository = AdminDashboardRepository;
