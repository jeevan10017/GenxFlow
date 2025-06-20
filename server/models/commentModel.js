const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    canvasId: {
      type: Schema.Types.ObjectId,
      ref: 'Canvas',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    resolved: {
      type: Boolean,
      default: false
    },
    replies: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Index for better query performance
CommentSchema.index({ canvasId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });

// Static method to get comments for a canvas
CommentSchema.statics.getCanvasComments = async function(canvasId) {
  try {
    const comments = await this.find({ canvasId })
      .populate('userId', 'name email')
      .populate('replies.userId', 'name email')
      .sort({ createdAt: -1 });
    return comments;
  } catch (error) {
    throw new Error('Failed to fetch comments: ' + error.message);
  }
};

// Static method to create a comment
CommentSchema.statics.createComment = async function(canvasId, userId, x, y, text) {
  try {
    const comment = new this({
      canvasId,
      userId,
      x,
      y,
      text: text.trim()
    });
    
    const savedComment = await comment.save();
    await savedComment.populate('userId', 'name email');
    return savedComment;
  } catch (error) {
    throw new Error('Failed to create comment: ' + error.message);
  }
};

// Instance method to add a reply
CommentSchema.methods.addReply = async function(userId, text) {
  try {
    this.replies.push({
      userId,
      text: text.trim(),
      createdAt: new Date()
    });
    
    const savedComment = await this.save();
    await savedComment.populate('replies.userId', 'name email');
    return savedComment;
  } catch (error) {
    throw new Error('Failed to add reply: ' + error.message);
  }
};

// Instance method to toggle resolved status
CommentSchema.methods.toggleResolved = async function() {
  try {
    this.resolved = !this.resolved;
    return await this.save();
  } catch (error) {
    throw new Error('Failed to toggle resolved status: ' + error.message);
  }
};

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;