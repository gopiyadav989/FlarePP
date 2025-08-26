import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Creator', 'Editor']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Creator', 'Editor']
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['read', 'unread'],
        default: 'unread'
    }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);