import express from 'express';
import { auth } from '../middlewares/auth.js';
import { 
    searchUsers, 
    sendMessage, 
    getConversations,
    getConversationMessages,
    markMessagesAsRead,
    getUnreadCount
} from '../controllers/messageController.js';

const router = express.Router();

// All message routes require authentication
router.get('/search-users', auth, searchUsers);
router.post('/send', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/conversation/:partnerId', auth, getConversationMessages);
router.post('/mark-read', auth, markMessagesAsRead);
router.get('/unread-count', auth, getUnreadCount);

export default router;