import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
    index: true,
    lowercase: true,
    trim: true,
  },
  upvotes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  upvoteCount: {
    type: Number,
    default: 0,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
ReplySchema.index({ topicId: 1, createdAt: 1 });
ReplySchema.index({ organizationName: 1, userId: 1 });

export default mongoose.models.Reply || mongoose.model('Reply', ReplySchema);
