"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const booking_entity_1 = require("../../domain/entities/booking.entity");
const booking_model_1 = __importDefault(require("../database/booking.model"));
const show_model_1 = __importDefault(require("../database/show.model"));
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
class BookingRepository {
    async create(booking) {
        try {
            const newBooking = new booking_model_1.default(booking);
            const savedBooking = await newBooking.save();
            return this.mapToEntity(savedBooking);
        }
        catch (error) {
            console.error('❌ Error creating booking:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_CREATING_BOOKING);
        }
    }
    async findById(bookingId) {
        try {
            const bookingDoc = await booking_model_1.default.findById(bookingId)
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .lean();
            return bookingDoc ? this.mapToEntity(bookingDoc) : null;
        }
        catch (error) {
            console.error('❌ Error finding booking:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_BOOKING);
        }
    }
    async findByBookingId(bookingId) {
        try {
            const bookingDoc = await booking_model_1.default.findOne({ bookingId })
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .populate({ path: 'bookedSeatsId', model: 'Seat' })
                .lean();
            return bookingDoc ? this.mapToEntity(bookingDoc) : null;
        }
        catch (error) {
            console.error('❌ Error finding booking:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_BOOKING);
        }
    }
    async findBookingsOfUser(params) {
        try {
            const { userId, page = 1, limit = 8, status, sortBy, sortOrder } = params;
            const skip = (page - 1) * limit;
            const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
            if (status && status.length > 0) {
                query['status'] = { $in: status };
            }
            const sort = {};
            if (sortBy && sortOrder) {
                sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            const bookingDocs = await booking_model_1.default.find(query)
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .populate({ path: 'bookedSeatsId', model: 'Seat' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();
            const totalCount = await booking_model_1.default.countDocuments(query);
            return {
                bookings: bookingDocs.map(this.mapToEntity),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error finding bookings for user:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_BOOKING);
        }
    }
    async findAllBookings(params) {
        try {
            const { page = 1, limit = 8, search, status, sortBy, sortOrder } = params || {};
            const skip = (page - 1) * limit;
            const query = {};
            if (search) {
                query.bookingId = { $regex: search, $options: 'i' };
            }
            if (status && status.length > 0) {
                query.status = { $in: status };
            }
            const sort = {};
            if (sortBy && sortOrder) {
                sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            else {
                sort.createdAt = -1;
            }
            const bookingDocs = await booking_model_1.default.find(query)
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .populate({ path: 'bookedSeatsId', model: 'Seat' })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();
            const totalCount = await booking_model_1.default.countDocuments(query);
            return {
                bookings: bookingDocs.map(this.mapToEntity),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error finding all bookings:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_BOOKING);
        }
    }
    async updatePaymentStatusAndId(bookingId, paymentId) {
        try {
            await booking_model_1.default.findByIdAndUpdate(bookingId, {
                'payment.status': 'completed',
                'payment.paymentId': paymentId,
            });
        }
        catch (error) {
            console.error(`❌ Error updating payment for booking ${bookingId}:`, error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_BOOKING);
        }
    }
    async findBookingsOfVendor(params) {
        try {
            const { vendorId, page = 1, limit = 8, search, status, sortBy, sortOrder } = params;
            const skip = (page - 1) * limit;
            // First, find all showIds that belong to the vendor
            const shows = await mongoose_1.default.model('Show').find({ vendorId }, { _id: 1 }).lean();
            const showIds = shows.map((show) => show._id);
            const query = {
                showId: { $in: showIds },
            };
            if (search) {
                query.bookingId = { $regex: search, $options: 'i' };
            }
            if (status && status.length > 0) {
                query.status = { $in: status };
            }
            const sortQuery = {};
            if (sortBy && sortOrder) {
                sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            else {
                sortQuery.createdAt = -1;
            }
            const bookingDocs = await booking_model_1.default.find(query)
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .populate({ path: 'bookedSeatsId', model: 'Seat' })
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean();
            const totalCount = await booking_model_1.default.countDocuments(query);
            return {
                bookings: bookingDocs.map(this.mapToEntity),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error finding vendor bookings:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_BOOKING);
        }
    }
    async cancelBooking(bookingId, reason) {
        try {
            const booking = await booking_model_1.default.findOne({ _id: bookingId })
                .populate({ path: 'showId', select: '_id' }) // Only need showId
                .populate({ path: 'userId', select: '_id' }) // Only need userId
                .populate({ path: 'bookedSeatsId', model: 'Seat', select: 'number' }) // Populate Seat documents to get seat numbers
                .lean();
            if (!booking) {
                throw new Error(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND);
            }
            if (booking.status === 'cancelled') {
                return this.mapToEntity(booking);
            }
            const updatedBookingDoc = await booking_model_1.default.findByIdAndUpdate(booking._id, { status: 'cancelled', reason: reason }, { new: true })
                .populate({
                path: 'showId',
                model: 'Show',
                populate: [
                    { path: 'movieId', model: 'Movie' },
                    { path: 'theaterId', model: 'Theater' },
                ],
            })
                .populate({ path: 'userId', model: 'User' })
                .populate({ path: 'bookedSeatsId', model: 'Seat' })
                .lean();
            if (!updatedBookingDoc) {
                throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_CANCELLING_BOOKING);
            }
            const showId = booking.showId._id;
            const userId = booking.userId._id;
            const seatNumbersToPull = booking.bookedSeatsId.map((seat) => seat.number);
            await show_model_1.default.updateOne({ _id: showId }, {
                $pull: {
                    bookedSeats: {
                        userId: userId,
                        seatNumber: { $in: seatNumbersToPull },
                    },
                },
            });
            return this.mapToEntity(updatedBookingDoc);
        }
        catch (error) {
            console.error('❌ Error canceling booking:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_CANCELLING_BOOKING);
        }
    }
    async countBookings(userId) {
        return await booking_model_1.default.countDocuments({ userId });
    }
    mapToEntity(doc) {
        return new booking_entity_1.Booking(doc._id ?? null, doc.showId, doc.userId, doc.bookedSeatsId, doc.bookingId, doc.status, doc.payment, doc.qrCode, doc.subTotal, doc.couponDiscount, doc.couponApplied, doc.convenienceFee, doc.donation, doc.moviePassApplied, doc.moviePassDiscount ?? 0, doc.totalDiscount ?? 0, doc.totalAmount, doc.offerDiscount ?? 0, doc.expiresAt, doc.reason, doc.createdAt, doc.updatedAt);
    }
}
exports.BookingRepository = BookingRepository;
