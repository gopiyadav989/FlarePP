import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Creator', 'Editor']
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverModel'
    },
    receiverModel: {
        type: String,
        required: true,
        enum: ['Creator', 'Editor']
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
      }
}, {timestamps: true});

const Message = mongoose.model('Message', messageSchema);

export default Message;