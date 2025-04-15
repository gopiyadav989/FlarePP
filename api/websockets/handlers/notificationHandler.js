import Notification from '../../models/notificationModel.js';

/**
 * Send a notification to a user via WebSocket
 * @param {Object} notificationData - Notification data to send
 * @param {Map} clients - Map of connected WebSocket clients
 */
export const sendNotification = async (notificationData, clients) => {
  try {
    // Save notification to database
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Get the recipient's WebSocket connection if they're online
    const recipientWs = clients.get(notificationData.recipient.toString());
    
    if (recipientWs) {
      // Send notification via WebSocket
      recipientWs.send(JSON.stringify({
        type: 'notification',
        notification: {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
          relatedVideo: notification.relatedVideo,
          link: notification.link
        }
      }));
      
      console.log(`📬 Notification sent to user ${notificationData.recipient}`);
    } else {
      console.log(`📪 Recipient ${notificationData.recipient} is offline, notification stored only`);
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

/**
 * Handle notifications about video assignments
 * @param {Object} data - Video assignment data
 * @param {Map} clients - Map of connected WebSocket clients
 */
export const handleVideoAssigned = async (data, clients) => {
  const { videoId, videoTitle, editorId, editorName, creatorId } = data;
  
  // Create notification for the editor
  await sendNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'New Video Assignment',
    message: `You have been assigned to edit the video "${videoTitle}"`,
    type: 'VIDEO_ASSIGNED',
    relatedVideo: videoId,
    isRead: false,
    link: `/editor-dashboard/assigned-videos/${videoId}`
  }, clients);
};

/**
 * Handle notifications about video edits being completed
 * @param {Object} data - Video edit data
 * @param {Map} clients - Map of connected WebSocket clients
 */
export const handleVideoEdited = async (data, clients) => {
  const { videoId, videoTitle, creatorId, editorName } = data;
  
  // Create notification for the creator
  await sendNotification({
    recipient: creatorId,
    recipientModel: 'Creator',
    title: 'Video Edit Completed',
    message: `${editorName} has completed editing your video "${videoTitle}"`,
    type: 'VIDEO_EDITED', 
    relatedVideo: videoId,
    isRead: false,
    link: `/creator-dashboard/videos/${videoId}`
  }, clients);
};

/**
 * Handle notifications about video revisions being requested
 * @param {Object} data - Revision request data
 * @param {Map} clients - Map of connected WebSocket clients
 */
export const handleRevisionRequested = async (data, clients) => {
  const { videoId, videoTitle, editorId, creatorName, feedbackMessage } = data;
  
  // Create notification for the editor
  await sendNotification({
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Revision Requested',
    message: feedbackMessage || `${creatorName} has requested revisions for "${videoTitle}"`,
    type: 'VIDEO_REJECTED',
    relatedVideo: videoId,
    isRead: false,
    link: `/editor-dashboard/revisions/${videoId}`
  }, clients);
};

/**
 * Handle notifications about videos being published
 * @param {Object} data - Video publish data
 * @param {Map} clients - Map of connected WebSocket clients
 */
export const handleVideoPublished = async (data, clients) => {
  const { videoId, videoTitle, editorId } = data;
  
  if (editorId) {
    // Create notification for the editor
    await sendNotification({
      recipient: editorId,
      recipientModel: 'Editor',
      title: 'Video Published',
      message: `The video "${videoTitle}" you edited has been published!`,
      type: 'VIDEO_PUBLISHED',
      relatedVideo: videoId,
      isRead: false,
      link: `/editor-dashboard/completed/${videoId}`
    }, clients);
  }
}; 