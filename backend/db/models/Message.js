
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation', // Reference to the Conversation model
        required: true,
        index: true // Index for faster lookups by conversation
    },
    senderType: {
        type: String,
        enum: ['user', 'assistant'], // Messages can only be from 'user' or 'assistant'
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true }); // Mongoose `timestamps` option auto-adds createdAt and updatedAt

const Message = mongoose.model('Message', messageSchema);

export default Message;