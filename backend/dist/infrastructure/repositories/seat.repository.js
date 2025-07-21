"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatRepository = void 0;
const seatLayout_entity_1 = require("../../domain/entities/seatLayout.entity");
const seat_model_1 = __importDefault(require("../database/seat.model"));
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const mongoose_1 = __importDefault(require("mongoose"));
class SeatRepository {
    async findSeatsByLayoutId(layoutId) {
        try {
            const seatDocs = await seat_model_1.default.find({ seatLayoutId: layoutId }).lean();
            return seatDocs.map(this.mapToEntity);
        }
        catch (error) {
            console.error('❌ Error finding seats:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_SEATS);
        }
    }
    async findSeatsByIds(layoutId, seatIds) {
        try {
            const seatDocs = await seat_model_1.default.find({
                seatLayoutId: layoutId,
                _id: { $in: seatIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
            }).lean();
            return seatDocs.map(this.mapToEntity);
        }
        catch (error) {
            console.error('❌ Error finding seats:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_SEATS);
        }
    }
    async findSeatNumbersByIds(seatIds) {
        try {
            const seatDocs = await seat_model_1.default.find({
                _id: { $in: seatIds.map((id) => id) },
            }, { number: 1 }).lean();
            return seatDocs.map((seat) => seat.number);
        }
        catch (error) {
            console.error('❌ Error finding seat numbers:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_SEATS);
        }
    }
    async findSeatsByIdsSession(layoutId, seatIds, session) {
        try {
            const query = seat_model_1.default.find({
                seatLayoutId: layoutId,
                _id: { $in: seatIds.map((id) => new mongoose_1.default.Types.ObjectId(id)) },
            });
            if (session) {
                query.session(session);
            }
            const seatDocs = await query.lean();
            return seatDocs.map(this.mapToEntity);
        }
        catch (error) {
            console.error('❌ Error finding seats:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_SEATS);
        }
    }
    mapToEntity(doc) {
        return new seatLayout_entity_1.Seat(doc._id?.toString(), doc.uuid, doc.seatLayoutId, doc.number, doc.type, doc.price, doc.position);
    }
}
exports.SeatRepository = SeatRepository;
