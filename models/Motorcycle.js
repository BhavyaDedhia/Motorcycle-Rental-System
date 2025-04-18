import mongoose from 'mongoose';

const motorcycleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Please provide a brand'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Please provide a model'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Please provide a year'],
  },
  cc: {
    type: Number,
    required: [true, 'Please provide engine capacity'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a daily rental price'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '/images/motorcycle-placeholder.jpg',
  },
  available: {
    type: Boolean,
    default: true,
  },
  features: {
    type: [String],
    default: [],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Motorcycle must belong to a user'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Motorcycle || mongoose.model('Motorcycle', motorcycleSchema); 