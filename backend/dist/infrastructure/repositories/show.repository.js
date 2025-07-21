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
exports.ShowRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tsyringe_1 = require("tsyringe");
const show_entity_1 = require("../../domain/entities/show.entity");
const show_model_1 = __importDefault(require("../database/show.model"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const screen_model_1 = __importDefault(require("../database/screen.model"));
const movie_model_1 = __importDefault(require("../database/movie.model"));
const theater_model_1 = require("../database/theater.model");
const seatLayout_model_1 = __importDefault(require("../database/seatLayout.model"));
const booking_model_1 = __importDefault(require("../database/booking.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let ShowRepository = class ShowRepository {
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async create(show) {
        try {
            const showData = {
                startTime: show.startTime,
                endTime: show.endTime,
                movieId: new mongoose_1.default.Types.ObjectId(show.movieId),
                theaterId: new mongoose_1.default.Types.ObjectId(show.theaterId),
                screenId: new mongoose_1.default.Types.ObjectId(show.screenId),
                vendorId: new mongoose_1.default.Types.ObjectId(show.vendorId),
                status: show.status || 'Scheduled',
                showDate: show.showDate, // Add showDate
                bookedSeats: show.bookedSeats?.map((seat) => ({
                    date: seat.date,
                    isPending: seat.isPending,
                    seatNumber: seat.seatNumber,
                    seatPrice: seat.seatPrice,
                    type: seat.type,
                    position: seat.position,
                    userId: new mongoose_1.default.Types.ObjectId(seat.userId),
                })) || [],
            };
            const newShow = new show_model_1.default(showData);
            const savedShow = await newShow.save();
            // Update Screen filledTimes
            await screen_model_1.default.findByIdAndUpdate(show.screenId, {
                $push: {
                    filledTimes: { startTime: show.startTime, endTime: show.endTime, showId: savedShow._id },
                },
            });
            return this.mapToEntity(savedShow);
        }
        catch (error) {
            console.error('❌ Error creating show:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async update(show, existingShowStartTime) {
        try {
            const updatedShow = await show_model_1.default.findByIdAndUpdate(show._id, {
                startTime: show.startTime,
                endTime: show.endTime,
                movieId: new mongoose_1.default.Types.ObjectId(show.movieId),
                theaterId: new mongoose_1.default.Types.ObjectId(show.theaterId),
                screenId: new mongoose_1.default.Types.ObjectId(show.screenId),
                vendorId: new mongoose_1.default.Types.ObjectId(show.vendorId),
                status: show.status,
                showDate: show.showDate, // Add showDate
                bookedSeats: show.bookedSeats?.map((seat) => ({
                    date: seat.date,
                    isPending: seat.isPending,
                    seatNumber: seat.seatNumber,
                    seatPrice: seat.seatPrice,
                    type: seat.type,
                    position: seat.position,
                    userId: new mongoose_1.default.Types.ObjectId(seat.userId),
                })),
            }, { new: true })
                .populate('movieId', 'name duration')
                .populate('theaterId', 'name intervalTime')
                .populate('screenId', 'name')
                .lean();
            if (!updatedShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Update Screen filledTimes
            await screen_model_1.default.updateOne({
                _id: show.screenId,
                'filledTimes.showId': show._id,
                'filledTimes.startTime': existingShowStartTime,
            }, {
                $set: {
                    'filledTimes.$.startTime': show.startTime,
                    'filledTimes.$.endTime': show.endTime,
                },
            });
            return this.mapToEntity(updatedShow);
        }
        catch (error) {
            console.error('❌ Error updating show:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async delete(id) {
        try {
            const show = await show_model_1.default.findById(id).lean();
            if (!show) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            await show_model_1.default.findByIdAndDelete(id);
            await screen_model_1.default.updateOne({ _id: show.screenId }, { $pull: { filledTimes: { showId: new mongoose_1.default.Types.ObjectId(id) } } });
        }
        catch (error) {
            console.error('❌ Error deleting show:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_DELETED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findById(id) {
        try {
            const showDoc = await show_model_1.default.findById(id)
                .populate('movieId', 'name duration genre rating poster description')
                .populate('theaterId', 'name intervalTime location')
                .populate('screenId', 'name')
                .lean();
            if (!showDoc)
                return null;
            return this.mapToEntity(showDoc);
        }
        catch (error) {
            console.error('❌ Error finding show by ID:', error);
            throw new custom_error_1.CustomError('Failed to find show', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async updateStatus(id, status) {
        try {
            const updatedShow = await show_model_1.default.findByIdAndUpdate(id, { status }, { new: true })
                .populate('movieId', 'name duration')
                .populate('theaterId', 'name intervalTime')
                .populate('screenId', 'name')
                .lean();
            if (!updatedShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            return this.mapToEntity(updatedShow);
        }
        catch (error) {
            console.error('❌ Error updating show status:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(params) {
        try {
            const { page = 1, limit = 10, search, theaterId, movieId, screenId, status, sortBy, sortOrder, } = params;
            const skip = (page - 1) * limit;
            // Build match stage for the aggregation pipeline
            const match = {};
            if (theaterId)
                match.theaterId = new mongoose_1.default.Types.ObjectId(theaterId);
            if (movieId)
                match.movieId = new mongoose_1.default.Types.ObjectId(movieId);
            if (screenId)
                match.screenId = new mongoose_1.default.Types.ObjectId(screenId);
            if (status)
                match.status = status;
            // Aggregation pipeline for fetching shows
            const pipeline = [
                { $match: match },
                {
                    $lookup: {
                        from: 'movies',
                        localField: 'movieId',
                        foreignField: '_id',
                        as: 'movieId',
                    },
                },
                { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'theaters',
                        localField: 'theaterId',
                        foreignField: '_id',
                        as: 'theaterId',
                    },
                },
                { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'screens',
                        localField: 'screenId',
                        foreignField: '_id',
                        as: 'screenId',
                    },
                },
                { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
            ];
            // Add search criteria to the pipeline
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'movieId.name': { $regex: search, $options: 'i' } },
                            { 'theaterId.name': { $regex: search, $options: 'i' } },
                            { 'screenId.name': { $regex: search, $options: 'i' } },
                        ],
                    },
                });
            }
            // Add sorting
            const sort = {};
            if (sortBy && sortOrder) {
                sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
            }
            else {
                sort.createdAt = -1;
            }
            if (Object.keys(sort).length > 0) {
                pipeline.push({ $sort: sort });
            }
            // Add pagination
            pipeline.push({ $skip: skip }, { $limit: limit });
            // Execute aggregation pipeline
            const showDocs = await show_model_1.default.aggregate(pipeline).exec();
            // Count total documents using a simpler query
            const countQuery = {};
            if (theaterId)
                countQuery.theaterId = new mongoose_1.default.Types.ObjectId(theaterId);
            if (movieId)
                countQuery.movieId = new mongoose_1.default.Types.ObjectId(movieId);
            if (screenId)
                countQuery.screenId = new mongoose_1.default.Types.ObjectId(screenId);
            if (status)
                countQuery.status = status;
            // Handle search for count
            if (search) {
                const movieIds = await mongoose_1.default
                    .model('Movie')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                const theaterIds = await mongoose_1.default
                    .model('Theater')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                const screenIds = await mongoose_1.default
                    .model('Screen')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                countQuery.$or = [
                    { movieId: { $in: movieIds } },
                    { theaterId: { $in: theaterIds } },
                    { screenId: { $in: screenIds } },
                ];
            }
            const totalCount = await show_model_1.default.countDocuments(countQuery).exec();
            return {
                shows: showDocs.map((doc) => this.mapToEntity(doc)),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching shows:', error);
            throw new custom_error_1.CustomError('Failed to retrieve shows', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findShowsByVendor(params) {
        try {
            const { vendorId, page = 1, limit = 10, search, status, sortBy, sortOrder } = params;
            const skip = (page - 1) * limit;
            // Get theater IDs for the vendor
            const Theater = mongoose_1.default.model('Theater');
            const theaterIds = await Theater.find({ vendorId }).distinct('_id');
            // Build match stage for the aggregation pipeline
            const match = {
                theaterId: { $in: theaterIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
            };
            if (status)
                match.status = status;
            // Aggregation pipeline for fetching shows
            const pipeline = [
                { $match: match },
                {
                    $lookup: {
                        from: 'movies',
                        localField: 'movieId',
                        foreignField: '_id',
                        as: 'movieId',
                    },
                },
                { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'theaters',
                        localField: 'theaterId',
                        foreignField: '_id',
                        as: 'theaterId',
                    },
                },
                { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'screens',
                        localField: 'screenId',
                        foreignField: '_id',
                        as: 'screenId',
                    },
                },
                { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
            ];
            // Add search criteria to the pipeline
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'movieId.name': { $regex: search, $options: 'i' } },
                            { 'theaterId.name': { $regex: search, $options: 'i' } },
                            { 'screenId.name': { $regex: search, $options: 'i' } },
                        ],
                    },
                });
            }
            // Add sorting
            let sort = { showDate: -1 }; // Default sort by showDate descending
            if (sortBy && sortOrder) {
                if (sortBy === 'movieId.name') {
                    sort = { 'movieId.name': sortOrder === 'asc' ? 1 : -1 };
                }
                else if (sortBy === 'theaterId.name') {
                    sort = { 'theaterId.name': sortOrder === 'asc' ? 1 : -1 };
                }
                else if (sortBy === 'showDate') {
                    sort = { showDate: sortOrder === 'asc' ? 1 : -1 };
                }
            }
            pipeline.push({ $sort: sort });
            // Add pagination
            pipeline.push({ $skip: skip }, { $limit: limit });
            // Execute aggregation pipeline
            const showDocs = await show_model_1.default.aggregate(pipeline).exec();
            // Count total documents using a simpler query
            const countQuery = {
                theaterId: { $in: theaterIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
            };
            if (status)
                countQuery.status = status;
            if (search) {
                const movieIds = await mongoose_1.default
                    .model('Movie')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                const theaterIdsSearch = await mongoose_1.default
                    .model('Theater')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                const screenIds = await mongoose_1.default
                    .model('Screen')
                    .find({ name: { $regex: search, $options: 'i' } })
                    .distinct('_id');
                countQuery.$or = [
                    { movieId: { $in: movieIds } },
                    { theaterId: { $in: theaterIdsSearch } },
                    { screenId: { $in: screenIds } },
                ];
            }
            const totalCount = await show_model_1.default.countDocuments(countQuery).exec();
            const totalPages = Math.ceil(totalCount / limit);
            return {
                shows: showDocs.map((doc) => this.mapToEntity(doc)),
                totalCount,
                totalPages,
            };
        }
        catch (error) {
            console.error('❌ Error fetching shows by vendor:', error);
            throw new custom_error_1.CustomError('Failed to retrieve shows', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    mapToEntity(doc) {
        return new show_entity_1.Show(doc._id.toString(), doc.startTime, doc.movieId || doc.movieId?._id?.toString(), doc.theaterId || doc.theaterId?._id?.toString(), doc.screenId || doc.screenId?._id?.toString(), doc.vendorId || doc.vendorId?._id?.toString(), doc.status, doc.bookedSeats?.map((seat) => ({
            date: seat.date,
            isPending: seat.isPending,
            seatNumber: seat.seatNumber,
            seatPrice: seat.seatPrice,
            type: seat.type,
            position: seat.position,
            userId: seat.userId?._id?.toString() || seat.userId,
        })) || [], doc.endTime, doc.showDate);
    }
    async findShowSelection(params) {
        try {
            const { movieId, latitude, longitude, selectedLocation, date, priceRanges, timeSlots, facilities, } = params;
            if (isNaN(latitude) ||
                isNaN(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180) {
                throw new custom_error_1.CustomError('Invalid latitude or longitude values', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Validate movieId
            if (!mongoose_1.default.Types.ObjectId.isValid(movieId)) {
                throw new custom_error_1.CustomError('Invalid movie ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Validate date format (YYYY-MM-DD)
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                throw new custom_error_1.CustomError('Invalid date format', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Step 1: Find theaters within 25km or by city
            let theaterIds = [];
            try {
                const theatersWithinRadius = await theater_model_1.TheaterModel.find({
                    'location.type': 'Point',
                    location: {
                        $nearSphere: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [latitude, longitude],
                            },
                            $maxDistance: 25000,
                        },
                    },
                })
                    .select('_id')
                    .lean();
                theaterIds = theatersWithinRadius.map((theater) => theater._id.toString());
            }
            catch (geoError) {
                console.error('Geospatial query failed:', geoError);
            }
            // Fallback to city-based search
            if (theaterIds.length === 0) {
                let cityQuery = selectedLocation;
                if (['kozhikode', 'calicut'].includes(selectedLocation.toLowerCase())) {
                    cityQuery = '(Kozhikode|Calicut)';
                }
                const theatersInCity = await theater_model_1.TheaterModel.find({
                    'location.city': { $regex: cityQuery, $options: 'i' },
                })
                    .select('_id')
                    .lean();
                theaterIds = theatersInCity.map((theater) => theater._id.toString());
            }
            if (theaterIds.length === 0) {
                return {
                    movie: null,
                    theaters: [],
                };
            }
            // Step 2: Build show query
            const startOfDay = new Date(`${date}T00:00:00.000Z`);
            const endOfDay = new Date(`${date}T23:59:59.999Z`);
            const showQuery = {
                movieId: new mongoose_1.default.Types.ObjectId(movieId),
                theaterId: { $in: theaterIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
                showDate: { $gte: startOfDay, $lte: endOfDay }, // Filter for specific date
                status: { $in: ['Scheduled', 'Running'] },
            };
            // Step 3: Apply filters
            if (facilities && facilities.length > 0) {
                const facilityQuery = {};
                facilities.forEach((facility) => {
                    facilityQuery[`facilities.${facility}`] = true;
                });
                const filteredTheaterIds = await theater_model_1.TheaterModel.find(facilityQuery)
                    .select('_id')
                    .lean()
                    .then((theaters) => theaters.map((t) => t._id.toString()));
                showQuery.theaterId = {
                    $in: filteredTheaterIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
                };
            }
            if (timeSlots && timeSlots.length > 0) {
                const timeConditions = timeSlots.map((slot) => ({
                    startTime: {
                        $gte: new Date(`${date}T${slot.start}:00.000Z`),
                        $lte: new Date(`${date}T${slot.end}:59.999Z`),
                    },
                }));
                showQuery.$or = timeConditions;
            }
            if (priceRanges && priceRanges.length > 0) {
                const priceConditions = priceRanges.map((range) => ({
                    $or: [
                        { 'seatPrice.regular': { $gte: range.min, $lte: range.max } },
                        { 'seatPrice.premium': { $gte: range.min, $lte: range.max } },
                        { 'seatPrice.vip': { $gte: range.min, $lte: range.max } },
                    ],
                }));
                const seatLayoutIds = await seatLayout_model_1.default
                    .find({
                    $or: priceConditions,
                })
                    .select('_id')
                    .lean()
                    .then((seatLayouts) => seatLayouts.map((sl) => sl._id.toString()));
                const screenIds = await screen_model_1.default.find({
                    seatLayoutId: { $in: seatLayoutIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
                })
                    .select('_id')
                    .lean()
                    .then((screens) => screens.map((s) => s._id.toString()));
                showQuery.screenId = { $in: screenIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) };
            }
            // Step 4: Fetch shows with populated data
            const pipeline = [
                { $match: showQuery },
                {
                    $lookup: {
                        from: 'movies',
                        localField: 'movieId',
                        foreignField: '_id',
                        as: 'movieId',
                    },
                },
                { $unwind: { path: '$movieId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'theaters',
                        localField: 'theaterId',
                        foreignField: '_id',
                        as: 'theaterId',
                    },
                },
                { $unwind: { path: '$theaterId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'screens',
                        localField: 'screenId',
                        foreignField: '_id',
                        as: 'screenId',
                    },
                },
                { $unwind: { path: '$screenId', preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: 'seatlayouts',
                        localField: 'screenId.seatLayoutId',
                        foreignField: '_id',
                        as: 'seatLayout',
                    },
                },
                { $unwind: { path: '$seatLayout', preserveNullAndEmptyArrays: true } },
            ];
            const showDocs = await show_model_1.default.aggregate(pipeline).exec();
            // Step 5: Fetch movie details
            const movieDoc = await movie_model_1.default.findById(movieId)
                .select('name language genre rating duration')
                .lean();
            if (!movieDoc) {
                throw new custom_error_1.CustomError('Movie not found', httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
            }
            // Step 6: Group shows by theater and calculate seat status
            const theaterMap = new Map();
            for (const show of showDocs) {
                const theaterId = show.theaterId?._id?.toString();
                if (!theaterId)
                    continue;
                const bookedSeats = show.bookedSeats?.length || 0;
                const capacity = show.seatLayout?.capacity || 1;
                const fillPercentage = (bookedSeats / capacity) * 100;
                let status;
                if (fillPercentage >= 100) {
                    status = 'not-available';
                }
                else if (fillPercentage > 40) {
                    status = 'fast-filling';
                }
                else {
                    status = 'available';
                }
                const showTime = show.startTime;
                if (!theaterMap.has(theaterId)) {
                    theaterMap.set(theaterId, {
                        id: theaterId,
                        name: show.theaterId?.name || 'Unknown Theater',
                        rating: show.theaterId?.rating || 0,
                        facilities: show.theaterId?.facilities || {
                            foodCourt: false,
                            lounges: false,
                            mTicket: false,
                            parking: false,
                            freeCancellation: false,
                        },
                        images: show.theaterId?.gallery || [],
                        address: {
                            city: show.theaterId?.location?.city || '',
                            coordinates: show.theaterId?.location?.coordinates || [0, 0],
                        },
                        shows: [],
                    });
                }
                theaterMap.get(theaterId).shows.push({
                    time: showTime,
                    status,
                    _id: show._id,
                    amenities: show.screenId.amenities,
                });
            }
            // Step 7: Map movie details
            const movieDTO = {
                title: movieDoc.name,
                language: movieDoc.language,
                genres: movieDoc.genre,
                duration: `${movieDoc.duration.hours}h ${movieDoc.duration.minutes}m`,
                rating: movieDoc.rating,
            };
            return {
                movie: movieDTO,
                theaters: Array.from(theaterMap.values()),
            };
        }
        catch (error) {
            console.error('❌ Error fetching show selection:', error);
            throw new custom_error_1.CustomError(error instanceof custom_error_1.CustomError ? error.message : 'Failed to retrieve show selection', error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async updateBookedSeats(showId, bookedSeats) {
        try {
            const updatedShow = await show_model_1.default.findByIdAndUpdate(showId, { $push: { bookedSeats: { $each: bookedSeats } } }, { new: true })
                .populate('movieId', 'name duration')
                .populate('theaterId', 'name intervalTime')
                .populate('screenId', 'name')
                .lean();
            if (!updatedShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            return this.mapToEntity(updatedShow);
        }
        catch (error) {
            console.error('❌ Error updating booked seats:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async pullExpiredSeats(showId) {
        try {
            const expirationTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
            const result = await show_model_1.default.findByIdAndUpdate(showId, {
                $pull: {
                    bookedSeats: { isPending: true, date: { $lt: expirationTime } },
                },
            }, { new: true }).lean();
            if (!result) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            console.log(`✅ Removed expired pending seats from showId: ${showId}`);
        }
        catch (error) {
            console.error('❌ Error pulling expired pending seats:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_SAVED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async confirmBookedSeats(showId, seatNumbers) {
        try {
            const updatedShow = await show_model_1.default.findOneAndUpdate({ _id: new mongoose_1.default.Types.ObjectId(showId) }, // ensure it's cast correctly
            {
                $set: {
                    'bookedSeats.$[seat].isPending': false,
                },
            }, {
                new: true,
                arrayFilters: [{ 'seat.seatNumber': { $in: seatNumbers }, 'seat.isPending': true }],
            })
                .populate('movieId', 'name duration')
                .populate('theaterId', 'name intervalTime')
                .populate('screenId', 'name')
                .lean();
            if (!updatedShow) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.SHOW_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            return this.mapToEntity(updatedShow);
        }
        catch (error) {
            console.error('❌ Error confirming booked seats:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_UPDATED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async findByIdSession(id, session) {
        try {
            const query = show_model_1.default.findById(id).populate('movieId theaterId screenId');
            if (session) {
                query.session(session);
            }
            const showDoc = await query.lean();
            if (!showDoc)
                return null;
            // Map to Show entity
            return this.mapToEntity(showDoc);
        }
        catch (error) {
            console.error('❌ Error finding show:', error);
            throw new Error('Failed to find show');
        }
    }
    async updateBookedSeatsSession(showId, bookedSeats, session) {
        try {
            const updateQuery = show_model_1.default.findByIdAndUpdate(showId, { $push: { bookedSeats: { $each: bookedSeats } } }, { new: true });
            if (session) {
                updateQuery.session(session);
            }
            await updateQuery;
        }
        catch (error) {
            console.error('❌ Error updating booked seats:', error);
            throw new Error('Failed to update booked seats');
        }
    }
    async creditRevenueToWallet(showId) {
        try {
            const show = await show_model_1.default.findById(showId).lean();
            if (!show) {
                console.warn(`⚠️ Show with ID ${showId} not found`);
                return 0;
            }
            const completedBookings = await booking_model_1.default.find({
                showId: new mongoose_1.default.Types.ObjectId(showId),
                status: 'confirmed',
                'payment.status': 'completed',
            }).lean();
            if (!completedBookings.length) {
                console.log(`🟡 No completed bookings for show ${showId}`);
                return 0;
            }
            const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.payment.amount, 0);
            if (totalRevenue <= 0) {
                console.log(`🟡 Total revenue is 0 for show ${showId}`);
                return 0;
            }
            const ADMIN_COMMISSION_RATE = 0.15;
            const adminCommission = parseFloat((totalRevenue * ADMIN_COMMISSION_RATE).toFixed(2));
            const vendorShare = parseFloat((totalRevenue - adminCommission).toFixed(2));
            const targetUserId = process.env.ADMIN_USER_ID || '681a66250869b998bbad2545';
            const adminTransaction = {
                amount: adminCommission,
                type: 'credit',
                source: 'booking',
                createdAt: new Date(),
                remark: `Admin commission of ₹${adminCommission} from show ${showId}`,
            };
            const vendorTransaction = {
                amount: vendorShare,
                type: 'credit',
                source: 'booking',
                createdAt: new Date(),
                remark: `Vendor payout of ₹${vendorShare} from show ${showId} after admin commission 15%`,
            };
            const updatedAdminWallet = await this.walletRepository.pushTransactionAndUpdateBalance(targetUserId, adminTransaction);
            const updatedVendorWallet = await this.walletRepository.pushTransactionAndUpdateBalance(show.vendorId.toString(), vendorTransaction);
            if (!updatedAdminWallet || !updatedVendorWallet) {
                throw new Error(`Wallet update failed (Admin: ${targetUserId}, Vendor: ${show.vendorId})`);
            }
            console.log(`✅ ₹${adminCommission} credited to Admin and ₹${vendorShare} credited to Vendor for show ${showId}`);
            return totalRevenue;
        }
        catch (error) {
            console.error(`❌ Error in creditRevenueToWallet for show ${showId}:`, error);
            throw error;
        }
    }
};
exports.ShowRepository = ShowRepository;
exports.ShowRepository = ShowRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [Object])
], ShowRepository);
