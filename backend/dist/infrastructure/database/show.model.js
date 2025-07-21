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
const ShowSchema = new mongoose_1.Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    movieId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theaterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screenId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Screen', required: true },
    status: {
        type: String,
        enum: ['Scheduled', 'Running', 'Completed', 'Cancelled'],
        required: true,
    },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    showDate: { type: Date, required: true },
    bookedSeats: [
        {
            date: { type: Date, required: true },
            isPending: { type: Boolean, default: false },
            seatNumber: { type: String, required: true },
            seatPrice: { type: Number, required: true },
            type: { type: String, enum: ['VIP', 'Regular', 'Premium'], required: true },
            position: { row: Number, col: Number },
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
        },
    ],
}, { timestamps: true });
const Show = mongoose_1.default.model('Show', ShowSchema);
exports.default = Show;
