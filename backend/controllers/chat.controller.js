
import { ObjectId } from 'mongodb';
import { groqClient, conversations } from '../services/groq.service.js';

export const chat = async (req, res) => {
  // Destructure user_email (or default to 'anonymous' if not provided)
  const { message, conversation_id, user_email = 'anonymous' } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    let convId = conversation_id;

    // If no conversation_id, create a new conversation document
    if (!convId) {
      const result = await conversations.insertOne({
        user_email, // Store the user's email with the conversation
        created_at: new Date(),
        messages: [],
        updated_at: new Date(),
      });
      convId = result.insertedId.toString(); // Get the ID of the newly created conversation
    }

    // Prepare the user's message
    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    // Add the user's message to the conversation and update timestamp
    await conversations.updateOne(
      { _id: new ObjectId(convId) },
      { $push: { messages: userMsg }, $set: { updated_at: new Date() } }
    );

    // Fetch the conversation again to get recent messages for AI context
    const conv = await conversations.findOne({ _id: new ObjectId(convId) });

    // Prepare context for Groq (last 10 messages + system prompt)
    const context = [{ role: 'system', content: 'You are a helpful assistant.' }, ...conv.messages.slice(-10)];

    // Call Groq API for completion
    const response = await groqClient.chat.completions.create({
      model: process.env.GROK_MODEL || 'llama3-8b-8192', // Use model from env or default
      messages: context.map(m => ({ role: m.role, content: m.content })), // Map messages for Groq format
    });

    // Prepare the AI's response message
    const botReply = {
      role: 'assistant',
      content: response.choices[0].message.content,
      timestamp: new Date(),
    };

    // Add the AI's response to the conversation and update timestamp
    await conversations.updateOne(
      { _id: new ObjectId(convId) },
      { $push: { messages: botReply }, $set: { updated_at: new Date() } }
    );

    // Fetch the final updated conversation (optional, but good for returning full history)
    const updated = await conversations.findOne({ _id: new ObjectId(convId) });

    // Send the AI's response and conversation ID back to the frontend
    res.json({ response: botReply.content, conversation_id: convId, history: updated.messages });
  } catch (err) {
    console.error("Error in chat function:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    // Correctly extract user_email from req.params
    const { user_id } = req.params; // Your route still uses :user_id, we'll treat it as email

    if (!user_id) { // Checking for user_id (which is user_email here)
      return res.status(400).json({ message: 'User email is required to fetch conversations.' });
    }

    // Find conversations where 'user_email' matches the provided user_id (email)
    const convs = await conversations.find({ user_email: user_id }) // Query by user_email
      .project({ messages: { $slice: 1 }, created_at: 1, updated_at: 1 }) // Project only first message, timestamps
      .sort({ updated_at: -1 }) // Sort by most recently updated
      .limit(20) // Limit the number of conversations fetched
      .toArray(); // Convert cursor to array

    // Format the conversations for the frontend
    const formatted = convs.map(c => ({
      _id: c._id.toString(), // Convert ObjectId to string
      created_at: c.created_at.toISOString(),
      updated_at: c.updated_at.toISOString(),
      last_message: c.messages?.[0]?.content || '', // Get content of the first message as summary
    }));

    res.json(formatted); // Send formatted conversations
  } catch (err) {
    console.error("Error in getUserConversations function:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;

    if (!conversation_id) {
        return res.status(400).json({ message: 'Conversation ID is required.' });
    }

    // Find a single conversation by its _id
    const conv = await conversations.findOne({ _id: new ObjectId(conversation_id) });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    // Format _id and message timestamps for consistent frontend use
    conv._id = conv._id.toString();
    conv.messages = conv.messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));

    res.json(conv); // Send the full conversation object
  } catch (err) {
    console.error("Error in getConversation function:", err);
    res.status(500).json({ error: err.message });
  }
};