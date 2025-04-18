import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a recipient'],
  },
  type: {
    type: String,
    enum: ['booking_request', 'booking_confirmed', 'booking_cancelled', 'booking_completed', 'payment_received'],
    required: [true, 'Please provide a notification type'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a notification title'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  relatedMotorcycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorcycle',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema); 