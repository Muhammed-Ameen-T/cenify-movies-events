// src/domain/entities/seatLayout.entity.ts
import mongoose from 'mongoose';
import { ISeat } from '../interfaces/model/seat.interface';

export class Seat {
  constructor(
    public _id: mongoose.Types.ObjectId | null,
    public uuid: string,
    public seatLayoutId: mongoose.Types.ObjectId,
    public number: string,
    public type: 'VIP' | 'Regular' | 'Premium' | 'Unavailable',
    public price: number,
    public position: { row: number; col: number },
  ) {}
}

export class SeatLayout {
  constructor(
    public _id: mongoose.Types.ObjectId | null,
    public uuid: string,
    public vendorId: mongoose.Types.ObjectId,
    public layoutName: string,
    public seatPrice: { regular: number; premium: number; vip: number },
    public capacity: number,
    public seatIds: mongoose.Types.ObjectId[] | ISeat[],
    public rowCount: number,
    public columnCount: number,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
