import Message from '../models/messageModel.js';
import Creator from '../models/creatorModel.js';
import Editor from '../models/editorModel.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserRole = req.user.role;
        const currentUserId = req.user.id;

        let users;
        if (currentUserRole === 'editor') {
            // If editor, search among creators
            users = await Creator.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        } else if (currentUserRole === 'creator') {
            // If creator, search among editors
            users = await Editor.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        }

        res.status(200).json({
            message: "Users found successfully",
            users
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to search users",
            error: error.message
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        // Determine recipient role based on the current user's role
        const recipientRole = senderRole === 'editor' ? 'Creator' : 'Editor';

        const message = new Message({
            sender: senderId,
            senderModel: senderRole === 'editor' ? 'Editor' : 'Creator',
            recipient: recipientId,
            recipientModel: recipientRole,
            content
        });

        await message.save();

        res.status(201).json({
            message: "Message sent successfully",
            messageDetails: message
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to send message",
            error: error.message
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find unique conversation partners
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        {
                            sender: new mongoose.Types.ObjectId(userId),
                            senderModel: userRole === 'editor' ? 'Editor' : 'Creator'
                        },
                        {
                            recipient: new mongoose.Types.ObjectId(userId),
                            recipientModel: userRole === 'editor' ? 'Editor' : 'Creator'
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $last: '$content' },
                    lastMessageTime: { $last: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ['$recipient', new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ['$status', 'unread'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: userRole === 'editor' ? 'creators' : 'editors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    _id: '$userDetails._id',
                    name: '$userDetails.name',
                    username: '$userDetails.username',
                    avatar: '$userDetails.avatar',
                    lastMessage: 1,
                    lastMessageTime: 1,
                    unreadCount: 1
                }
            },
            { $sort: { lastMessageTime: -1 } }
        ]);

        res.status(200).json({
            message: "Conversations retrieved successfully",
            conversations
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve conversations",
            error: error.message
        });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerId } = req.params;
        const userRole = req.user.role;

        const messages = await Message.find({
            $or: [
                {
                    sender: userId,
                    recipient: partnerId
                },
                {
                    sender: partnerId,
                    recipient: userId
                }
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');

        res.status(200).json({
            message: "Conversation messages retrieved successfully",
            messages
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve conversation messages",
            error: error.message
        });
    }
};


export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const sender = req.body.sender;

        // Mark messages as read for this sender and recipient pair
        await Message.updateMany(
            {
                sender,
                recipient: userId,
                status: 'unread'
            },
            { status: 'read' }
        );

        res.status(200).json({
            message: "Messages marked as read"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to mark messages as read",
            error: error.message
        });
    }
};