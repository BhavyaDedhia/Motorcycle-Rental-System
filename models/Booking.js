import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  motorcycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorcycle',
    required: [true, 'Please provide a motorcycle'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please provide a total price'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Validate that end date is after start date
bookingSchema.pre('save', function(next) {
  // Convert dates to timestamps for proper comparison
  const startTimestamp = new Date(this.startDate).getTime();
  const endTimestamp = new Date(this.endDate).getTime();
  
  if (endTimestamp < startTimestamp) {
    return next(new Error('End date must be after or equal to start date'));
  }
  return next();
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema); 