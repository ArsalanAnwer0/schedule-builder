import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '💬',
  },
  order: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: '#14b8a6',
  },
}, {
  timestamps: true,
});

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ order: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
