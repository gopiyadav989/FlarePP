import Message from '../models/messageModel.js';
import Creator from '../models/creatorModel.js';
import Editor from '../models/editorModel.js';

export const searchUsers = async (req, res) => {
    console.log("Search request received");
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
                users: []
            });
        }

        console.log("Searching for:", query);
        // Declare users variable
        let users = [];
        const currentUserRole = "editor"; // You might want to get this from req.user.role
        
        if (currentUserRole === 'editor') {
            // If editor, search among creators
            users = await Creator.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar'); // Only select needed fields
        } else if (currentUserRole === 'creator') {
            // If creator, search among editors
            users = await Editor.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            }).select('_id name username avatar');
        }

        console.log(users);

        // Format users to match frontend expectations
        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name || '',
            username: user.username || '',
            avatar: user.avatar || '',
        }));

        console.log("Found users:", formattedUsers.length);

        res.status(200).json({
            success: true,
            message: "Users found successfully",
            users: formattedUsers
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search users",
            error: error.message,
            users: []
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

        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: partnerId },
                { sender: partnerId, recipient: userId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'name avatar')
        .select('content status createdAt sender');

        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { sender } = req.body;

        await Message.updateMany(
            {
                sender: new mongoose.Types.ObjectId(sender),
                recipient: new mongoose.Types.ObjectId(userId),
                status: 'unread'
            },
            {
                $set: { status: 'read' }
            }
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
            error: error.message
        });
    }
};