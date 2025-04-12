import express from "express"
import { searchUsers, getConversations, getMessages, sendMessage, markMessagesAsRead } from "../controllers/messageController.js";
import { auth, isCreator, isEditor } from "../middlewares/auth.js";
const router = express.Router();

router.get('/search-users',auth, searchUsers);
router.get('/conversations', auth,getConversations);
router.get('/conversation/:partnerId', auth,getMessages);
router.post('/send',auth, sendMessage);
router.post('/mark-read', auth,markMessagesAsRead);

export default router