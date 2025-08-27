const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel'
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['Creator', 'Editor']
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['EDITOR_ASSIGNED', 'EDIT_COMPLETED', 'REVISION_REQUESTED', 'COMMENT_ADDED', 'FEEDBACK_RECEIVED']
    },
    read: {
      type: Boolean,
      default: false
    },
    relatedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    link: {
      type: String
    }
  },
  { timestamps: true }
);

// Create indexes for faster queries
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// TTL index for automatic cleanup after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 