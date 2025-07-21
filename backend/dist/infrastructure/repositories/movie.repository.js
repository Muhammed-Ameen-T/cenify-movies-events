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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieRepository = void 0;
const tsyringe_1 = require("tsyringe");
const movie_entity_1 = require("../../domain/entities/movie.entity");
const movie_model_1 = __importDefault(require("../database/movie.model"));
const show_model_1 = __importDefault(require("../database/show.model"));
const theater_model_1 = require("../database/theater.model");
const mongoose_1 = __importDefault(require("mongoose"));
let MovieRepository = class MovieRepository {
    constructor() { }
    async create(movie) {
        try {
            const newMovie = new movie_model_1.default(movie);
            const savedMovie = await newMovie.save();
            return this.mapToEntity(savedMovie);
        }
        catch (error) {
            console.error('❌ Error creating movie:', error);
            if (error instanceof Error) {
                throw new Error(`Error creating movie: ${error.message}`);
            }
            throw new Error('Failed to create movie: An unknown error occurred');
        }
    }
    async findAll(params) {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 8;
            const skip = (page - 1) * limit;
            const query = {};
            if (params?.search) {
                query.name = { $regex: params.search, $options: 'i' };
            }
            if (params?.status && params.status.length > 0) {
                query.status = { $in: params.status };
            }
            if (params?.genre && params.genre.length > 0) {
                query.genre = { $in: params.genre };
            }
            const sort = {};
            if (params?.sortBy && params?.sortOrder) {
                sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1;
            }
            const movieDocs = await movie_model_1.default.find(query).sort(sort).skip(skip).limit(limit).lean();
            const totalCount = await movie_model_1.default.countDocuments(query);
            return {
                movies: movieDocs.map((doc) => this.mapToEntity(doc)),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching movies:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to retrieve movies: ${error.message}`);
            }
            throw new Error('Failed to retrieve movies: An unknown error occurred');
        }
    }
    async findAllByUserLocation(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 8;
            const skip = (page - 1) * limit;
            if (isNaN(params.latitude) ||
                params.latitude < -90 ||
                params.latitude > 90 ||
                isNaN(params.longitude) ||
                params.longitude < -180 ||
                params.longitude > 180) {
                console.warn(`Invalid coordinates: latitude=${params.latitude}, longitude=${params.longitude}`);
                throw new Error('Invalid latitude or longitude values');
            }
            console.log(`Input params: latitude=${params.latitude}, longitude=${params.longitude}, selectedLocation=${params.selectedLocation}, sortBy=${params.sortBy}, sortOrder=${params.sortOrder}`);
            const movieQuery = {};
            if (params.search) {
                movieQuery.name = { $regex: params.search, $options: 'i' };
            }
            // Exclude 'archived' movies
            if (params.status && params.status.length > 0) {
                const filteredStatuses = params.status.filter((s) => s !== 'archived');
                if (filteredStatuses.length === 0) {
                    console.warn('All selected statuses are "released"; returning empty set');
                    return { movies: [], totalCount: 0 };
                }
                movieQuery.status = { $in: filteredStatuses };
            }
            else {
                movieQuery.status = { $ne: 'archived' };
            }
            if (params.genre && params.genre.length > 0) {
                movieQuery.genre = { $in: params.genre };
            }
            let sortField;
            if (params.sortBy) {
                switch (params.sortBy) {
                    case 'popularity':
                        sortField = 'rating';
                        break;
                    case 'releaseDate':
                        sortField = 'releaseDate';
                        break;
                    case 'name':
                        sortField = 'name';
                        break;
                    default:
                        sortField = undefined;
                }
            }
            const sort = {};
            if (sortField && params.sortOrder) {
                sort[sortField] = params.sortOrder === 'asc' ? 1 : -1;
                console.log(`Applying sort: { ${sortField}: ${params.sortOrder} }`);
            }
            else {
                console.log('No valid sort applied');
            }
            let theaterIds = [];
            const indexes = await theater_model_1.TheaterModel.collection.indexes();
            const has2dsphereIndex = indexes.some((index) => index.key?.location === '2dsphere');
            console.log('2dsphere index exists:', has2dsphereIndex);
            if (!has2dsphereIndex) {
                console.warn('No 2dsphere index found. Creating...');
                await theater_model_1.TheaterModel.createIndexes();
            }
            const theaterDataCheck = await theater_model_1.TheaterModel.find({
                'location.city': { $regex: '(Kozhikode|Calicut)', $options: 'i' },
            })
                .select('name location')
                .lean();
            console.log('Theater data check:', theaterDataCheck.map((t) => ({
                name: t.name,
                location: t.location,
                isValidGeoJSON: t.location?.type === 'Point' &&
                    Array.isArray(t.location?.coordinates) &&
                    t.location.coordinates.length === 2,
            })));
            try {
                const theatersWithinRadius = await theater_model_1.TheaterModel.find({
                    'location.type': 'Point',
                    location: {
                        $nearSphere: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [params.latitude, params.longitude],
                            },
                            $maxDistance: 25000,
                        },
                    },
                })
                    .select('_id location name')
                    .lean();
                theaterIds = theatersWithinRadius.map((t) => t._id.toString());
                console.log(`Found ${theaterIds.length} theaters within 25km`);
            }
            catch (geoError) {
                console.error('Geospatial query failed:', geoError);
            }
            if (theaterIds.length === 0) {
                let cityQuery = params.selectedLocation;
                if (['kozhikode', 'calicut'].includes(cityQuery.toLowerCase())) {
                    cityQuery = '(Kozhikode|Calicut)';
                }
                console.log(`Fallback city-based search: ${cityQuery}`);
                const theatersInCity = await theater_model_1.TheaterModel.find({
                    'location.city': { $regex: cityQuery, $options: 'i' },
                })
                    .select('_id location name')
                    .lean();
                theaterIds = theatersInCity.map((t) => t._id.toString());
                console.log(`Found ${theaterIds.length} theaters in city`);
            }
            if (theaterIds.length === 0) {
                console.warn(`No theaters found for location: ${params.selectedLocation}`);
                return { movies: [], totalCount: 0 };
            }
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const shows = await show_model_1.default.find({
                theaterId: { $in: theaterIds },
                status: { $in: ['Scheduled', 'Running'] },
                showDate: { $gte: currentDate },
            })
                .select('movieId')
                .lean();
            const movieIds = [...new Set(shows.map((show) => show.movieId.toString()))];
            console.log(`Found ${movieIds.length} unique movie IDs`);
            if (movieIds.length === 0) {
                console.warn('No active shows found for theaters');
                return { movies: [], totalCount: 0 };
            }
            movieQuery._id = { $in: movieIds };
            const movieDocs = await movie_model_1.default.find(movieQuery).sort(sort).skip(skip).limit(limit).lean();
            const totalCount = await movie_model_1.default.countDocuments(movieQuery);
            console.log(`Returning ${movieDocs.length} movies, totalCount: ${totalCount}`);
            return {
                movies: movieDocs.map((doc) => this.mapToEntity(doc)),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching movies by user location:', error);
            throw new Error(`Failed to retrieve movies: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findById(id) {
        try {
            const movieDoc = await movie_model_1.default.findById(id)
                .populate({
                path: 'reviews.userId',
                model: 'User',
                select: 'name profileImage',
            })
                .lean();
            return movieDoc ? this.mapToEntity(movieDoc) : null;
        }
        catch (error) {
            console.error('❌ Error fetching movie with populated user reviews:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to retrieve movie: ${error.message}`);
            }
            throw new Error('Failed to retrieve movie: An unknown error occurred');
        }
    }
    async updateStatus(id, status) {
        try {
            const movieDoc = await movie_model_1.default.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true }).lean();
            if (!movieDoc)
                throw new Error('Movie not found');
            return this.mapToEntity(movieDoc);
        }
        catch (error) {
            console.error('❌ Error updating movie status:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to update movie status: ${error.message}`);
            }
            throw new Error('Failed to update movie status: An unknown error occurred');
        }
    }
    async update(movie) {
        try {
            const updatedMovie = await movie_model_1.default.findByIdAndUpdate(movie._id, { ...movie, updatedAt: new Date() }, { new: true }).lean();
            if (!updatedMovie)
                throw new Error('Movie not found');
            return this.mapToEntity(updatedMovie);
        }
        catch (error) {
            console.error('❌ Error updating movie:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to update movie: ${error.message}`);
            }
            throw new Error('Failed to update movie: An unknown error occurred');
        }
    }
    async addReviewAndUpdateRating(movieId, review) {
        try {
            // Push the new review
            const updatedMovieDoc = await movie_model_1.default.findByIdAndUpdate(movieId, {
                $push: {
                    reviews: {
                        comment: review.comment,
                        rating: review.rating,
                        userId: review.userId,
                        createdAt: new Date(),
                        likes: 0,
                    },
                },
            }, { new: true }).lean();
            if (!updatedMovieDoc) {
                console.error('❌ Movie not found for adding review:', movieId);
                throw new Error('Movie not found');
            }
            // Recalculate average rating
            const reviews = updatedMovieDoc.reviews ? updatedMovieDoc.reviews : [];
            const totalRating = reviews.reduce((acc, r) => acc + parseFloat(String(r.rating ?? '0')), 0);
            const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;
            // Update movie's average rating
            const finalUpdatedMovie = await movie_model_1.default.findByIdAndUpdate(movieId, { rating: averageRating, updatedAt: new Date() }, { new: true }).lean();
            if (!finalUpdatedMovie)
                throw new Error('Failed to update rating');
            return this.mapToEntity(finalUpdatedMovie);
        }
        catch (error) {
            console.error('❌ Error adding review and updating rating:', error);
            throw new Error(`Failed to add review: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findReviewByUserId(movieId, userId) {
        try {
            const movie = await movie_model_1.default.findOne({ _id: movieId, 'reviews.userId': userId }, { 'reviews.$': 1 }).lean();
            const review = movie?.reviews?.[0];
            if (!review)
                return null;
            return {
                comment: review.comment ?? '',
                createdAt: review.createdAt ?? new Date(0),
                rating: String(review.rating ?? ''),
                likes: review.likes ?? 0,
                userId: new mongoose_1.default.Types.ObjectId(String(review.userId)),
            };
        }
        catch (error) {
            console.error('❌ Error finding review by userId:', error);
            throw new Error('Failed to retrieve user review');
        }
    }
    async hasUserLikedMovie(movieId, userId) {
        try {
            const movie = await movie_model_1.default.findOne({
                _id: movieId,
                likedBy: userId,
            }).lean();
            return !!movie; // true if movie exists with userId in likedBy
        }
        catch (error) {
            console.error('❌ Error checking likedBy array:', error);
            throw new Error('Failed to check if user liked the movie');
        }
    }
    async likeMovie(movieId, userId, isLike) {
        try {
            const update = isLike
                ? {
                    $addToSet: { likedBy: userId },
                    $inc: { likes: 1 },
                }
                : {
                    $pull: { likedBy: userId },
                    $inc: { likes: -1 },
                };
            const updatedMovie = await movie_model_1.default.findByIdAndUpdate(movieId, update, {
                new: true,
            }).lean();
            return this.mapToEntity(updatedMovie);
        }
        catch (error) {
            console.error('❌ Error updating like status:', error);
            throw new Error('Failed to update like status');
        }
    }
    mapToEntity(doc) {
        return new movie_entity_1.Movie(doc._id, doc.name, doc.genre, doc.trailer, doc.rating, doc.poster, doc.duration, doc.description, doc.language, doc.releaseDate, doc.status, doc.likes, doc.likedBy, doc.is3D, doc.crew, doc.cast, doc.reviews, doc.createdAt, doc.updatedAt);
    }
};
exports.MovieRepository = MovieRepository;
exports.MovieRepository = MovieRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MovieRepository);
