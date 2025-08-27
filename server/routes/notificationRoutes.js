const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createNotification } = require('../../api/utils/notificationUtils.js');

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get notifications for a user (creator or editor)
router.get('/user/:userId/:userType', authenticateToken, async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    // Verify the requesting user is authorized to see these notifications
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to notifications' });
    }
    
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: userType
    })
    .sort({ createdAt: -1 })
    .limit(20);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread notification count
router.get('/count/:userId/:userType', authenticateToken, async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    // Verify the requesting user is authorized
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    const count = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark a notification as read
router.patch('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Verify the requesting user owns this notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized access to this notification' });
    }
    
    notification.read = true;
    await notification.save();
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all/:userId/:userType', authenticateToken, async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    // Verify the requesting user is authorized
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    await Notification.updateMany(
      { recipient: userId, recipientModel: userType, read: false },
      { read: true }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 