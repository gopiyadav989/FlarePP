import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import Creator from '../models/creatorModel.js';
import Editor from '../models/editorModel.js';

export const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const currentUserRole = req.user.role;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        if (!q.trim()) {
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
                    { username: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        } else if (currentUserRole === 'creator') {
            // Creators can search editors
            users = await Editor.find({
                $or: [
                    { username: { $regex: q, $options: 'i' } },
                    { name: { $regex: q, $options: 'i' } }
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

        // Basic validation
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

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(recipientId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID format"
            });
        }

        // Check if trying to send message to self
        if (senderId === recipientId) {
            return res.status(400).json({
                success: false,
                message: "Cannot send message to yourself"
            });
        }

        // Validate sender role
        if (!senderRole || !['creator', 'editor'].includes(senderRole)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sender role"
            });
        }

        // Determine models and validate role compatibility
        const senderModel = senderRole === 'editor' ? 'Editor' : 'Creator';
        const recipientModel = senderRole === 'editor' ? 'Creator' : 'Editor';

        // Verify recipient exists and has compatible role
        const RecipientModel = senderRole === 'editor' ? Creator : Editor;
        const recipient = await RecipientModel.findById(recipientId);
        
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found or invalid role compatibility"
            });
        }

        // Create and save message with proper sender/recipient field structure
        const message = new Message({
            sender: new mongoose.Types.ObjectId(senderId),
            senderModel: senderModel,
            recipient: new mongoose.Types.ObjectId(recipientId),
            recipientModel: recipientModel,
            content: content.trim(),
            status: 'unread'
        });

        const savedMessage = await message.save();

        // Return response format matching frontend expectations
        res.status(201).json({
            success: true,
            message: {
                _id: savedMessage._id,
                content: savedMessage.content,
                createdAt: savedMessage.createdAt,
                sender: {
                    _id: senderId,
                    name: req.user.name || '',
                    username: req.user.username || '',
                    avatar: req.user.avatar || ''
                },
                isOwn: true
            }
        });
    } catch (error) {
        console.error("Send message error:", error);
        
        // Handle specific error types
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Invalid message data: " + error.message
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid recipient ID format"
            });
        }

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

        // Find unique conversation partners with proper aggregation
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
                    messages: { $push: '$$ROOT' }
                }
            },
            {
                $addFields: {
                    unreadCount: {
                        $size: {
                            $filter: {
                                input: '$messages',
                                cond: {
                                    $and: [
                                        { $eq: ['$$this.recipient', userObjectId] },
                                        { $eq: ['$$this.status', 'unread'] }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: userRole === 'editor' ? 'creators' : 'editors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partnerDetails'
                }
            },
            {
                $unwind: {
                    path: '$partnerDetails',
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $project: {
                    _id: '$partnerDetails._id',
                    name: { $ifNull: ['$partnerDetails.name', ''] },
                    username: { $ifNull: ['$partnerDetails.username', ''] },
                    avatar: { $ifNull: ['$partnerDetails.avatar', ''] },
                    lastMessage: { $ifNull: ['$lastMessage', ''] },
                    lastMessageTime: '$lastMessageTime',
                    unreadCount: '$unreadCount'
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            },
            {
                $limit: 20
            }
        ]);

        // Ensure we always return an array, even if empty
        const formattedConversations = conversations || [];

        res.status(200).json({
            success: true,
            conversations: formattedConversations
        });
    } catch (error) {
        console.error("Get conversations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve conversations",
            conversations: []
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

        // Fetch messages between the two users
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: partnerId },
                { sender: partnerId, recipient: userId }
            ]
        })
            .sort({ createdAt: 1 })
            .select('content status createdAt sender recipient senderModel')
            .limit(50); // Limit to 50 messages for performance

        // Use aggregation to populate sender details more efficiently
        const populatedMessages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId), recipient: new mongoose.Types.ObjectId(partnerId) },
                        { sender: new mongoose.Types.ObjectId(partnerId), recipient: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: 1 }
            },
            {
                $limit: 50
            },
            {
                $lookup: {
                    from: 'creators',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'creatorSender',
                    pipeline: [
                        { $project: { name: 1, avatar: 1, username: 1 } }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'editors',
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'editorSender',
                    pipeline: [
                        { $project: { name: 1, avatar: 1, username: 1 } }
                    ]
                }
            },
            {
                $addFields: {
                    senderDetails: {
                        $cond: [
                            { $eq: ['$senderModel', 'Creator'] },
                            { $arrayElemAt: ['$creatorSender', 0] },
                            { $arrayElemAt: ['$editorSender', 0] }
                        ]
                    },
                    isOwn: { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] }
                }
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    status: 1,
                    createdAt: 1,
                    sender: {
                        _id: '$sender',
                        name: { $ifNull: ['$senderDetails.name', ''] },
                        avatar: { $ifNull: ['$senderDetails.avatar', ''] },
                        username: { $ifNull: ['$senderDetails.username', ''] }
                    },
                    isOwn: 1
                }
            }
        ]);

        // Mark messages as read - only mark messages sent TO the current user as read
        await Message.updateMany(
            {
                sender: partnerId,
                recipient: userId,
                status: 'unread'
            },
            {
                $set: { status: 'read' }
            }
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