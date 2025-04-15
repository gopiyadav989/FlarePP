import axios from 'axios';

/**
 * Creates a notification for a specific event
 * @param {Object} notificationData - Notification data
 * @returns {Promise} - The created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const response = await axios.post('/api/notifications', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Notification trigger for when an editor is assigned to a video
 * @param {Object} data - Contains videoId, videoTitle, editorId, editorName, creatorId
 * @returns {Promise} - The created notification
 */
export const notifyEditorAssigned = async ({
  videoId,
  videoTitle,
  editorId,
  editorName,
  creatorId,
}) => {
  const notificationData = {
    recipient: creatorId,
    recipientModel: 'Creator',
    title: 'Editor Assigned',
    message: `${editorName} has been assigned to your video "${videoTitle}"`,
    type: 'EDITOR_ASSIGNED',
    relatedVideo: videoId,
    link: `/creator-dashboard/video/${videoId}`
  };
  
  return createNotification(notificationData);
};

/**
 * Notification trigger for when an edited video is uploaded
 * @param {Object} data - Contains videoId, videoTitle, creatorId
 * @returns {Promise} - The created notification
 */
export const notifyEditCompleted = async ({
  videoId,
  videoTitle,
  creatorId,
}) => {
  const notificationData = {
    recipient: creatorId,
    recipientModel: 'Creator',
    title: 'Edit Completed',
    message: `Your video "${videoTitle}" has been edited and is ready for review`,
    type: 'EDIT_COMPLETED',
    relatedVideo: videoId,
    link: `/creator-dashboard/video/${videoId}`
  };
  
  return createNotification(notificationData);
};

/**
 * Notification trigger for when a creator requests revisions
 * @param {Object} data - Contains videoId, videoTitle, editorId
 * @returns {Promise} - The created notification
 */
export const notifyRevisionRequested = async ({
  videoId,
  videoTitle,
  editorId,
}) => {
  const notificationData = {
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Revision Requested',
    message: `Revisions have been requested for the video "${videoTitle}"`,
    type: 'REVISION_REQUESTED',
    relatedVideo: videoId,
    link: `/editor-dashboard/assigned-videos/${videoId}`
  };
  
  return createNotification(notificationData);
};

/**
 * Notification trigger for when a comment is added to a video
 * @param {Object} data - Contains videoId, videoTitle, commenterId, commenterName, recipientId, recipientModel
 * @returns {Promise} - The created notification
 */
export const notifyCommentAdded = async ({
  videoId,
  videoTitle,
  commenterId,
  commenterName,
  recipientId,
  recipientModel,
}) => {
  const notificationData = {
    recipient: recipientId,
    recipientModel,
    title: 'New Comment',
    message: `${commenterName} commented on "${videoTitle}"`,
    type: 'COMMENT_ADDED',
    relatedVideo: videoId,
    link: recipientModel === 'Creator' 
      ? `/creator-dashboard/video/${videoId}` 
      : `/editor-dashboard/assigned-videos/${videoId}`
  };
  
  return createNotification(notificationData);
};

/**
 * Notification trigger for when feedback is received on an edit
 * @param {Object} data - Contains videoId, videoTitle, creatorId, creatorName, editorId
 * @returns {Promise} - The created notification
 */
export const notifyFeedbackReceived = async ({
  videoId,
  videoTitle,
  creatorId,
  creatorName,
  editorId,
}) => {
  const notificationData = {
    recipient: editorId,
    recipientModel: 'Editor',
    title: 'Feedback Received',
    message: `${creatorName} has provided feedback on "${videoTitle}"`,
    type: 'FEEDBACK_RECEIVED',
    relatedVideo: videoId,
    link: `/editor-dashboard/assigned-videos/${videoId}`
  };
  
  return createNotification(notificationData);
}; 