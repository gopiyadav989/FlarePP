import Notification from '../models/notificationModel.js';

// Simple notification types
export const NOTIFICATION_TYPES = {
  VIDEO_ASSIGNED: 'VIDEO_ASSIGNED',
  VIDEO_EDITED: 'VIDEO_EDITED', 
  VIDEO_REJECTED: 'VIDEO_REJECTED',
  VIDEO_APPROVED: 'VIDEO_APPROVED',
  VIDEO_PUBLISHED: 'VIDEO_PUBLISHED',
  NEW_MESSAGE: 'NEW_MESSAGE'
};

// Create notification - simple and direct
export const createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

// Video assignment notification
export const createVideoAssignmentNotification = async (editorId, videoId, videoTitle, creatorName) => {
  return await createNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'New Video Assignment',
    message: `You have been assigned to edit "${videoTitle}" by ${creatorName}`,
    type: NOTIFICATION_TYPES.VIDEO_ASSIGNED,
    relatedVideo: videoId,
    link: `/editor/videos/${videoId}`
  });
};

// Video edited notification
export const createVideoEditedNotification = async (creatorId, videoId, videoTitle, editorName) => {
  return await createNotification({
    recipient: creatorId,
    recipientModel: 'Creator',
    title: 'Video Edit Completed',
    message: `${editorName} has completed editing your video "${videoTitle}"`,
    type: NOTIFICATION_TYPES.VIDEO_EDITED,
    relatedVideo: videoId,
    link: `/creator/videos/${videoId}`
  });
};

// Video rejection notification
export const createVideoRejectionNotification = async (editorId, videoId, videoTitle, creatorName, feedback) => {
  return await createNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Revision Requested',
    message: feedback || `${creatorName} has requested revisions for "${videoTitle}"`,
    type: NOTIFICATION_TYPES.VIDEO_REJECTED,
    relatedVideo: videoId,
    link: `/editor/videos/${videoId}`
  });
};

// Video approval notification
export const createVideoApprovalNotification = async (editorId, videoId, videoTitle, creatorName) => {
  return await createNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Video Approved',
    message: `${creatorName} has approved your edit of "${videoTitle}"`,
    type: NOTIFICATION_TYPES.VIDEO_APPROVED,
    relatedVideo: videoId,
    link: `/editor/videos/${videoId}`
  });
};

// Video published notification
export const createVideoPublishedNotification = async (editorId, videoId, videoTitle) => {
  return await createNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Video Published',
    message: `The video "${videoTitle}" you edited has been published!`,
    type: NOTIFICATION_TYPES.VIDEO_PUBLISHED,
    relatedVideo: videoId,
    link: `/editor/videos/${videoId}`
  });
};

// New message notification
export const createNewMessageNotification = async (recipientId, recipientModel, senderName) => {
  return await createNotification({
    recipient: recipientId,
    recipientModel: recipientModel,
    title: 'New Message',
    message: `You have a new message from ${senderName}`,
    type: NOTIFICATION_TYPES.NEW_MESSAGE,
    link: '/messages'
  });
};



// Get unread count
export const getUnreadNotificationCount = async (userId, userModel) => {
  return await Notification.countDocuments({
    recipient: userId,
    recipientModel: userModel,
    isRead: false
  });
};

// Mark notifications as read
export const markNotificationsAsRead = async (userId, userModel, notificationIds = null) => {
  const query = {
    recipient: userId,
    recipientModel: userModel,
    isRead: false
  };

  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }

  return await Notification.updateMany(query, { isRead: true });
};