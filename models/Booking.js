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
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentDetails: {
    cardNumber: {
      type: String,
      select: false,
    },
    cardExpiry: {
      type: String,
      select: false,
    },
    cardCVV: {
      type: String,
      select: false,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card'],
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentDate: {
      type: Date,
    },
  },
  cancellationReason: {
    type: String,
    trim: true,
  },
  cancellationDate: {
    type: Date,
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

// Update motorcycle availability when booking status changes
bookingSchema.post('save', async function(doc) {
  const Motorcycle = mongoose.model('Motorcycle');
  const motorcycle = await Motorcycle.findById(doc.motorcycle);
  
  if (motorcycle) {
    if (doc.status === 'confirmed' || doc.status === 'pending') {
      motorcycle.available = false;
    } else if (doc.status === 'cancelled' || doc.status === 'completed' || doc.status === 'rejected') {
      // Check if there are any other active bookings
      const activeBookings = await mongoose.model('Booking').find({
        motorcycle: doc.motorcycle,
        status: { $in: ['pending', 'confirmed'] },
        _id: { $ne: doc._id }
      });
      motorcycle.available = activeBookings.length === 0;
    }
    await motorcycle.save();
  }
});

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema); 