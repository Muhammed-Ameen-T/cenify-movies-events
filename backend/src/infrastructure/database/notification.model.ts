import mongoose, { Schema } from 'mongoose';
import { INotification } from '../../domain/interfaces/model/notification.interface';

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
    readedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
