// models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    required: true,
    index: true // For faster queries
  },
  conversationId: {
    type: String,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Chat || mongoose.model('Chat', chatSchema);