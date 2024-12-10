import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Editor",
        required: true,
    },
    type: {
        type: String,
        enum: ["NEW_ASSIGNMENT", "DEADLINE_REMINDER", "REVISION_REQUEST", "APPROVAL", "MESSAGE"],
        required: true,
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // Automatically delete after 30 days
    }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);