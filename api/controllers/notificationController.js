import Notification from '../models/notificationModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

// Get notifications for the current user
export const getNotifications = async (req, res) => {
    try {
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('video', 'title thumbnail');

        const total = await Notification.countDocuments({ recipient: req.user._id });

        res.status(200).json({
            notifications,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching notifications"
        });
    }
};

// Mark a single notification as read
export const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { 
                _id: req.params.id,
                recipient: req.user._id 
            },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error marking notification as read"
        });
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                recipient: req.user._id,
                read: false
            },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Error marking all notifications as read"
        });
    }
};

// Create a notification
export const createNotification = async (recipientId, type, message, videoId = null) => {
    try {
        const notification = await Notification.create({
            recipient: recipientId,
            type,
            message,
            video: videoId
        });

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
};

// Deleting notifications older than 30 days
export const cleanupOldNotifications = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await Notification.deleteMany({
            createdAt: { $lt: thirtyDaysAgo }
        });
    } catch (error) {
        console.error("Error cleaning up notifications:", error);
        throw error;
    }
};