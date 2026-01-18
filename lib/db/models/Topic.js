import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  replyCount: {
    type: Number,
    default: 0,
  },
  upvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  upvoteCount: {
    type: Number,
    default: 0,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  lastActivityBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
TopicSchema.index({ organizationName: 1, categoryId: 1, lastActivityAt: -1 });
TopicSchema.index({ organizationName: 1, upvoteCount: -1 });
TopicSchema.index({ organizationName: 1, isPinned: -1, lastActivityAt: -1 });
TopicSchema.index({ title: 'text', content: 'text' });

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
