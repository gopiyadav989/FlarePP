import {
  createVideoAssignmentNotification,
  createVideoEditedNotification,
  createVideoRejectionNotification,
  createVideoApprovalNotification,
  createVideoPublishedNotification,
  createNewMessageNotification
} from '../utils/notificationUtils.js';

// Video assignment notification middleware
export const notifyVideoAssignment = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
      const { editorId, videoId, videoTitle, creatorName } = req.body;
      
      if (editorId && videoId && videoTitle) {
        createVideoAssignmentNotification(editorId, videoId, videoTitle, creatorName)
          .catch(error => console.error('Failed to send notification:', error));
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Video edited notification middleware
export const notifyVideoEdited = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300 && data.success) {
      const { creatorId, videoId, videoTitle, editorName } = req.body;
      
      if (creatorId && videoId && videoTitle) {
        createVideoEditedNotification(creatorId, videoId, videoTitle, editorName)
          .catch(error => console.error('Failed to send notification:', error));
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};