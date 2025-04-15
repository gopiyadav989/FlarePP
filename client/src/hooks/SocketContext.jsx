import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// Import any actions you need to refresh data
// For example:
// import { updateVideos } from '../redux/reducers/videoSlice';

// Create context
const SocketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const socket = useRef(null);
  const reconnectTimeout = useRef(null);
  
  // Event callback registry
  const callbackRegistry = useRef({
    newMessage: null,
    typingStatus: null,
    videoUploaded: null,
    videoUpdated: null,
    notification: null,
    // Add more event types here
  });
  
  // Connect to WebSocket
  const connectSocket = () => {
    if (!user?._id) return;
    
    try {
      // Create WebSocket connection
      const ws = new WebSocket('ws://localhost:3000/ws');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        
        // Authenticate with user ID
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user._id
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data.type);
          
          switch (data.type) {
            case 'auth_success':
              console.log('WebSocket authentication successful');
              break;
              
            case 'new_message':
              if (callbackRegistry.current.newMessage) {
                callbackRegistry.current.newMessage(data.message);
              }
              break;
              
            case 'typing_status':
              if (callbackRegistry.current.typingStatus) {
                callbackRegistry.current.typingStatus(data.senderId, data.isTyping);
              }
              break;
              
            case 'video_uploaded':
              if (callbackRegistry.current.videoUploaded) {
                callbackRegistry.current.videoUploaded(data.video);
              }
              
              // You can also directly update Redux state here
              // dispatch(updateVideos(data.video));
              
              // Show notification
              showNotification('New video uploaded', data.video.title);
              break;
              
            case 'video_updated':
              if (callbackRegistry.current.videoUpdated) {
                callbackRegistry.current.videoUpdated(data.video);
              }
              
              // Show notification
              showNotification('Video updated', data.video.title);
              break;
              
            case 'notification':
              // Handle the new notification
              if (callbackRegistry.current.notification) {
                callbackRegistry.current.notification(data.notification);
              }
              
              // Add to notifications state
              setNotifications(prev => [data.notification, ...prev]);
              
              // Increment unread count
              setUnreadNotifications(prev => prev + 1);
              
              // Show browser notification
              showNotification(data.notification.title, data.notification.message);
              break;
              
            case 'user_status':
              setOnlineUsers(prev => ({
                ...prev,
                [data.userId]: data.status
              }));
              break;
              
            case 'user_statuses':
              setOnlineUsers(prev => ({
                ...prev,
                ...data.statuses
              }));
              break;
              
            case 'ping':
              // Keep-alive response
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
              
            case 'error':
              console.error('WebSocket error:', data.error);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);
        
        // Try to reconnect after 3 seconds
        if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = setTimeout(connectSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socket.current = ws;
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };
  
  // Register callback for message event
  const registerMessageHandler = (callback) => {
    callbackRegistry.current.newMessage = callback;
  };
  
  // Register callback for typing event
  const registerTypingHandler = (callback) => {
    callbackRegistry.current.typingStatus = callback;
  };
  
  // Register callback for video upload event
  const registerVideoUploadHandler = (callback) => {
    callbackRegistry.current.videoUploaded = callback;
  };
  
  // Register callback for video update event
  const registerVideoUpdateHandler = (callback) => {
    callbackRegistry.current.videoUpdated = callback;
  };
  
  // Register callback for notification event
  const registerNotificationHandler = (callback) => {
    callbackRegistry.current.notification = callback;
  };
  
  // Send message via WebSocket
  const sendMessage = (recipientId, content, tempId) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'message',
      senderId: user._id,
      recipientId,
      content,
      tempId
    }));
    
    return true;
  };
  
  // Send typing status
  const sendTyping = (recipientId, isTyping) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'typing',
      senderId: user._id,
      recipientId,
      isTyping
    }));
    
    return true;
  };
  
  // Notify others about video upload
  const notifyVideoUploaded = (videoData) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'video_uploaded',
      userId: user._id,
      video: videoData
    }));
    
    return true;
  };
  
  // Notify others about video update
  const notifyVideoUpdated = (videoData) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'video_updated',
      userId: user._id,
      video: videoData
    }));
    
    return true;
  };
  
  // Notify about assigning an editor to a video
  const notifyEditorAssigned = (data) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'video_assigned',
      ...data
    }));
    
    return true;
  };
  
  // Notify about video edit completion
  const notifyVideoEdited = (data) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'video_edited',
      ...data
    }));
    
    return true;
  };
  
  // Notify about revision request
  const notifyRevisionRequested = (data) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'revision_requested',
      ...data
    }));
    
    return true;
  };
  
  // Notify about video being published
  const notifyVideoPublished = (data) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'video_published',
      ...data
    }));
    
    return true;
  };
  
  // Get user statuses
  const getUserStatuses = (userIds) => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    socket.current.send(JSON.stringify({
      type: 'get_user_status',
      userIds
    }));
    
    return true;
  };
  
  // Mark notification(s) as read
  const markNotificationsAsRead = async (notificationIds) => {
    try {
      // Update the UI optimistically
      if (Array.isArray(notificationIds)) {
        setNotifications(prev => 
          prev.map(n => 
            notificationIds.includes(n._id) ? { ...n, isRead: true } : n
          )
        );
        setUnreadNotifications(prev => Math.max(0, prev - notificationIds.length));
      } else if (notificationIds === 'all') {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotifications(0);
      }
      
      // Call API to update in the database
      await fetch(`/api/notifications/${Array.isArray(notificationIds) ? 'mark-read' : 'mark-all-read'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: Array.isArray(notificationIds) ? JSON.stringify({ notificationIds }) : ''
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  // Simple notification function (can be replaced with a proper notification system)
  const showNotification = (title, message) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  };
  
  // Connect/disconnect when user changes
  useEffect(() => {
    if (user?._id) {
      connectSocket();
    } else if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
    
    return () => {
      if (socket.current) {
        socket.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [user?._id]);
  
  // Provide socket functionality
  const value = {
    connected,
    onlineUsers,
    notifications,
    unreadNotifications,
    sendMessage,
    sendTyping,
    getUserStatuses,
    registerMessageHandler,
    registerTypingHandler,
    registerVideoUploadHandler,
    registerVideoUpdateHandler,
    registerNotificationHandler,
    notifyVideoUploaded,
    notifyVideoUpdated,
    notifyEditorAssigned,
    notifyVideoEdited,
    notifyRevisionRequested,
    notifyVideoPublished,
    markNotificationsAsRead
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};