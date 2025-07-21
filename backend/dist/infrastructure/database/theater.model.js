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
exports.TheaterModel = void 0;
// src/infrastructure/database/theater.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const TheaterSchema = new mongoose_1.Schema({
    screens: [{ type: mongoose_1.Schema.Types.ObjectId }],
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'verified', 'verifying', 'blocked'] },
    location: {
        city: { type: String },
        coordinates: [{ type: Number }], // [longitude, latitude]
        type: { type: String, enum: ['Point'], default: 'Point' }, // Changed to uppercase 'Point'
    },
    facilities: {
        foodCourt: { type: Boolean, default: false },
        lounges: { type: Boolean, default: false },
        mTicket: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        freeCancellation: { type: Boolean, default: false },
    },
    intervalTime: { type: Number, enum: [5, 10, 15, 20, 30] },
    gallery: [{ type: String }],
    email: { type: String },
    phone: { type: Number },
    description: { type: String },
    vendorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
TheaterSchema.index({ location: '2dsphere' });
exports.TheaterModel = mongoose_1.default.model('Theater', TheaterSchema);
