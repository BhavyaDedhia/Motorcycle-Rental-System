import mongoose from 'mongoose';
import Booking from './Booking';
import Review from './Review';

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
  images: {
    type: [String],
    required: [true, 'Please provide at least one image'],
    validate: {
      validator: function(v) {
        if (!Array.isArray(v)) return false;
        if (v.length === 0) return false;
        return v.every(url => typeof url === 'string' && url.trim().length > 0);
      },
      message: 'Please provide at least one valid image URL'
    },
    set: function(v) {
      // Filter out any invalid or empty URLs
      if (Array.isArray(v)) {
        return v.filter(url => typeof url === 'string' && url.trim().length > 0);
      }
      return v;
    }
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
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: []
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { strictPopulate: false });

export default mongoose.models.Motorcycle || mongoose.model('Motorcycle', motorcycleSchema); 