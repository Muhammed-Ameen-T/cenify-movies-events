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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const movieSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    genre: [{ type: String, required: true }],
    trailer: { type: String, required: true },
    rating: { type: Number, required: true },
    poster: { type: String, required: true },
    duration: {
        hours: { type: Number, required: true },
        minutes: { type: Number, required: true },
        seconds: { type: Number, default: 0 },
    },
    description: { type: String, required: true },
    language: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    status: { type: String, required: true, default: 'upcoming' },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose_1.Schema.Types.ObjectId, required: true }],
    is3D: { type: Boolean, default: false },
    crew: [
        {
            id: { type: String },
            name: { type: String },
            role: { type: String },
            profileImage: { type: String },
        },
    ],
    cast: [
        {
            id: { type: String },
            name: { type: String },
            as: { type: String },
            profileImage: { type: String },
        },
    ],
    reviews: [
        {
            comment: { type: String },
            createdAt: { type: Date },
            rating: { type: String },
            likes: { type: Number },
            userId: { type: mongoose_1.Schema.Types.ObjectId },
        },
    ],
}, { timestamps: true });
const MovieModel = mongoose_1.default.model('Movie', movieSchema);
exports.default = MovieModel;
