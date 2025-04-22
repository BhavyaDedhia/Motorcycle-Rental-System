import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  motorcycle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motorcycle',
    required: [true, 'Question must be associated with a motorcycle'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Question must be associated with a user'],
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  answer: {
    text: {
      type: String,
      trim: true,
      default: '',
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    answeredAt: {
      type: Date,
    },
  },
  isAnswered: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

// Update isAnswered status when answer is provided
questionSchema.pre('save', function(next) {
  if (this.answer.text && this.answer.text.trim() !== '') {
    this.isAnswered = true;
    this.answer.answeredAt = new Date();
  }
  next();
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema); 