import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["Creator", "Editor"],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "VIDEO_ASSIGNED",
        "VIDEO_EDITED",
        "VIDEO_REJECTED",
        "VIDEO_APPROVED",
        "VIDEO_PUBLISHED",
        "NEW_MESSAGE",
      ],
      required: true,
    },
    relatedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// TTL index for automatic cleanup after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model("Notification", notificationSchema);