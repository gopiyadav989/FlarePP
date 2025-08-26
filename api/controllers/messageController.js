import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import Creator from '../models/creatorModel.js';
import Editor from '../models/editorModel.js';

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        const currentUserRole = req.user.role;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        if (!query.trim()) {
            return res.status(400).json({
                success: false,
                message: "Search query cannot be empty"
            });
        }

        let users = [];

        if (currentUserRole === 'editor') {
            // Editors can search creators
            users = await Creator.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        } else if (currentUserRole === 'creator') {
            // Creators can search editors
            users = await Editor.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        } else {
            return res.status(403).json({
                success: false,
                message: "Invalid user role"
            });
        }

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name || '',
            username: user.username || '',
            avatar: user.avatar || ''
        }));

        res.status(200).json({
            success: true,
            message: "Users found successfully",
            users: formattedUsers
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search users"
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.id;
        const senderRole = req.user.role;

        // Validation
        if (!recipientId || !content) {
            return res.status(400).json({
                success: false,
                message: "Recipient ID and content are required"
            });
        }

        if (!content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty"
            });
        }

        // Check if trying to send message to self
        if (senderId === recipientId) {
            return res.status(400).json({
                success: false,
                message: "Cannot send message to yourself"
            });
        }

        // Determine models based on roles
        const senderModel = senderRole === 'editor' ? 'Editor' : 'Creator';
        const recipientModel = senderRole === 'editor' ? 'Creator' : 'Editor';

        // Verify recipient exists
        const RecipientModel = senderRole === 'editor' ? Creator : Editor;
        const recipient = await RecipientModel.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found"
            });
        }

        const message = new Message({
            sender: senderId,
            senderModel: senderModel,
            recipient: recipientId,
            recipientModel: recipientModel,
            content: content.trim()
        });

        await message.save();

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            messageDetails: message
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Find unique conversation partners
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId },
                        { recipient: userObjectId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', userObjectId] },
                            '$recipient',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$content' },
                    lastMessageTime: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$recipient', userObjectId] },
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
            success: true,
            message: "Conversations retrieved successfully",
            conversations
        });
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve conversations"
        });
    }
};

export const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { partnerId } = req.params;

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: "Partner ID is required"
            });
        }

        // Validate partner exists
        const userRole = req.user.role;
        const PartnerModel = userRole === 'editor' ? Creator : Editor;
        const partner = await PartnerModel.findById(partnerId);
        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Conversation partner not found"
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: partnerId },
                { sender: partnerId, recipient: userId }
            ]
        })
            .sort({ createdAt: 1 })
            .select('content status createdAt sender recipient senderModel');

        // Populate sender details based on senderModel
        const populatedMessages = await Promise.all(
            messages.map(async (message) => {
                const SenderModel = message.senderModel === 'Editor' ? Editor : Creator;
                const senderDetails = await SenderModel.findById(message.sender).select('name avatar username');

                return {
                    _id: message._id,
                    content: message.content,
                    status: message.status,
                    createdAt: message.createdAt,
                    sender: {
                        _id: message.sender,
                        name: senderDetails?.name || '',
                        avatar: senderDetails?.avatar || '',
                        username: senderDetails?.username || ''
                    },
                    isOwn: message.sender.toString() === userId
                };
            })
        );

        res.status(200).json({
            success: true,
            messages: populatedMessages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { senderId } = req.body;

        if (!senderId) {
            return res.status(400).json({
                success: false,
                message: "Sender ID is required"
            });
        }

        const result = await Message.updateMany(
            {
                sender: senderId,
                recipient: userId,
                status: 'unread'
            },
            {
                $set: { status: 'read' }
            }
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as read',
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const unreadCount = await Message.countDocuments({
            recipient: userId,
            status: 'unread'
        });

        res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
};