import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Creator",
        required: true,
    },
    editor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Editor",
    },
    creatorUploadedVideo : {
        type: String,
        required: true,
    },
    editorUploadedVideo: {
        type: String,
    },
    revisions: {
        type: Number,
        default: 0
    },
    youtubePublishDetails: {
        videoId: String,
        publishedAt: Date
    },
    status: {
        type: String,
        enum: ["uploaded", "assigned", "edited", "approved", "published"],
        default: "uploaded",
    },
},{timestamps: true});

export default mongoose.model("Video", videoSchema);
