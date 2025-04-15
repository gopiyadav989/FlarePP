import Notification from '../models/notificationModel.js';
import Creator from "../models/creatorModel.js";
import Editor from "../models/editorModel.js";

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
            { isRead: true },
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

// Create a notification
export const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
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

/**
 * Get notifications for the authenticated user
 */
export const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Determine the model type based on user role
        const recipientModel = userRole === "creator" ? "Creator" : "Editor";
        
        // Get user's notifications
        const notifications = await Notification.find({
            recipient: userId,
            recipientModel: recipientModel,
        })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate("relatedVideo", "title thumbnail");
        
        // Get unread count
        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            recipientModel: recipientModel,
            isRead: false,
        });
        
        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
            error: error.message,
        });
    }
};

/**
 * Mark notifications as read
 */
export const markNotificationsAsRead = async (req, res) => {
    try {
        const { notificationIds } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Determine the model type based on user role
        const recipientModel = userRole === "creator" ? "Creator" : "Editor";
        
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                message: "Notification IDs array is required",
            });
        }
        
        // Mark specific notifications as read
        if (notificationIds.length > 0) {
            await Notification.updateMany(
                {
                    _id: { $in: notificationIds },
                    recipient: userId,
                    recipientModel: recipientModel,
                },
                { isRead: true }
            );
        }
        
        res.status(200).json({
            success: true,
            message: "Notifications marked as read",
        });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notifications as read",
            error: error.message,
        });
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        
        // Determine the model type based on user role
        const recipientModel = userRole === "creator" ? "Creator" : "Editor";
        
        // Mark all user's notifications as read
        await Notification.updateMany(
            {
                recipient: userId,
                recipientModel: recipientModel,
                isRead: false,
            },
            { isRead: true }
        );
        
        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read",
            error: error.message,
        });
    }
};