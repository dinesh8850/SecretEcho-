// pages/api/chat.js
import Chat from '../../models/Chat';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { userEmail, message, conversationId, messages } = req.body;

      let chat;
      if (conversationId) {
        // Update existing conversation
        chat = await Chat.findOneAndUpdate(
          { conversationId },
          { $push: { messages: { role: 'user', content: message } } },
          { new: true }
        );
      } else {
        // Create new conversation
        chat = await Chat.create({
          userEmail,
          messages: [...messages, { role: 'assistant', content: 'Hello! How can I help you?' }],
          conversationId: generateConversationId() // Implement your ID generator
        });
      }

      res.status(200).json({
        updatedMessages: chat.messages,
        conversationId: chat.conversationId
      });
    } catch (error) {
      res.status(500).json({ message: 'Error processing chat' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generateConversationId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}