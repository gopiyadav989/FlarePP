import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
    },
    role: {
        type: String,
        default: "creator",
        required: true,
    },
    youtubeChannelId: {
        type: String,
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "videoModel"
        }
    ],
    preferredEditors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Editor"
        }
    ],
    socialLinks: [
        {
            type: String
        }
    ]
}, { timestamps: true });

creatorSchema.index({ username: 'text', name: 'text' });

export default mongoose.model("Creator", creatorSchema);
