import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Update motorcycle rating when a review is added
reviewSchema.post('save', async function(doc) {
  const Motorcycle = mongoose.model('Motorcycle');
  const motorcycle = await Motorcycle.findById(doc.motorcycle);
  
  if (motorcycle) {
    const reviews = await mongoose.model('Review').find({ motorcycle: doc.motorcycle });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    motorcycle.rating = totalRating / reviews.length;
    await motorcycle.save();
  }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema); 