import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String, // Or mongoose.Schema.Types.ObjectId if linking to a User model
        required: true,
        index: true // Index for faster lookups by user
    },
    title: {
        type: String,
        default: 'New Chat' // Default title, can be updated later
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting by recent activity
    }
}, { timestamps: true }); // Mongoose `timestamps` option auto-adds createdAt and updatedAt

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;