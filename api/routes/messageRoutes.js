import express from 'express';
import { auth } from '../middlewares/auth.js';
import { 
    searchUsers, 
    sendMessage, 
    getConversations,
    getConversationMessages
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/search-users', auth, searchUsers);
router.post('/send', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/conversation/:partnerId', auth, getConversationMessages);

export default router;