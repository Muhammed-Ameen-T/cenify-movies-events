import mongoose, { Schema } from 'mongoose';
import { IScreen } from '../../domain/interfaces/model/screen.interface';

const ScreenSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    theaterId: { type: Schema.Types.ObjectId, required: true, ref: 'Theater' },
    seatLayoutId: {
      type: Schema.Types.ObjectId,
      ref: 'SeatLayout',
      required: true,
      index: true,
    },
    filledTimes: [
      {
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        showId: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
      },
    ],
    amenities: {
      is3D: { type: Boolean, default: false },
      is4K: { type: Boolean, default: false },
      isDolby: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

const Screen = mongoose.model<IScreen>('Screen', ScreenSchema);

export default Screen;
