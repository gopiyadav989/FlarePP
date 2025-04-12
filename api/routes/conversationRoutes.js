import express from "express";
import { 
  getUserConversations,
  getOrCreateConversation,
  sendMessageInConversation,
  markConversationAsRead,
  archiveConversation,
} from "../controllers/conversationController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);

router.get('/', getUserConversations);
router.post('/get-or-create', getOrCreateConversation);
router.post('/message', sendMessageInConversation);
router.put('/:conversationId/read', markConversationAsRead);
router.delete('/:conversationId', archiveConversation);

export default router