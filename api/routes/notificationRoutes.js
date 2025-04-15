import express from "express";
import { auth } from "../middlewares/auth.js";
import { 
  getUserNotifications, 
  markNotificationsAsRead, 
  markAllNotificationsAsRead 
} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications for the current user
router.get("/", auth, getUserNotifications);

// Mark specific notifications as read
router.post("/mark-read", auth, markNotificationsAsRead);

// Mark all notifications as read
router.post("/mark-all-read", auth, markAllNotificationsAsRead);

export default router; 