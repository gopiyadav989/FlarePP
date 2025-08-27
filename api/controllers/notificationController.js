import Notification from '../models/notificationModel.js';

// Get notifications for user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const recipientModel = userRole === "creator" ? "Creator" : "Editor";
    
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: recipientModel,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("relatedVideo", "title thumbnail");
    
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const recipientModel = userRole === "creator" ? "Creator" : "Editor";
    
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        message: "Notification IDs array is required",
      });
    }
    
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
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const recipientModel = userRole === "creator" ? "Creator" : "Editor";
    
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
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};