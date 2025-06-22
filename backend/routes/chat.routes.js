import express from 'express';
import { chat, getUserConversations, getConversation } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/', chat); // POST /chat
router.get('/conversations/:user_id', getUserConversations); // GET /chat/conversations/:user_id
router.get('/conversation/:conversation_id', getConversation); // GET /chat/conversation/:conversation_id



export default router;
