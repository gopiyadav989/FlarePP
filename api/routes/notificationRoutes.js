import express from "express";
import { auth } from "../middlewares/auth.js";
import { 
  getUserNotifications, 
  markNotificationsAsRead, 
  markAllNotificationsAsRead 
} from "../controllers/notificationController.js";
import { getUnreadNotificationCount } from "../utils/notificationUtils.js";
import { runCleanupNow } from "../utils/notificationCleanup.js";

const router = express.Router();

// Get notifications for current user
router.get("/", auth, getUserNotifications);

// Mark specific notifications as read
router.post("/mark-read", auth, markNotificationsAsRead);

// Mark all notifications as read
router.post("/mark-all-read", auth, markAllNotificationsAsRead);

// Get unread notification count
router.get("/unread-count", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const recipientModel = userRole === "creator" ? "Creator" : "Editor";
    
    const count = await getUnreadNotificationCount(userId, recipientModel);
    
    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
});

// Manual cleanup endpoint
router.post("/cleanup", auth, async (req, res) => {
  try {
    await runCleanupNow();
    
    res.status(200).json({
      success: true,
      message: "Notification cleanup completed"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run cleanup",
      error: error.message
    });
  }
});

export default router;