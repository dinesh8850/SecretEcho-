import { ObjectId } from 'mongodb';
import { groqClient, conversations, generateImage } from '../services/groq.service.js';

// Character Configuration
const CHARACTER_CONFIG = {
  name: "Mystic Raven",
  personality: "mysterious, wise, and slightly ominous",
  backstory: "An ancient being who has seen civilizations rise and fall",
  speechPattern: "speaks in riddles and metaphors",
  imageStyle: "mystical fantasy art, dark feathers, glowing eyes, cinematic lighting",
  description: "Mystic Raven is an ancient, enigmatic being who speaks in riddles and metaphors, offering profound insights and guiding seekers through their journeys.",
  examples: [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Greetings, seeker. The winds whisper of your arrival." },
    { role: "user", content: "What's the meaning of life?" },
    { role: "assistant", content: "Like the raven's flight, the answer circles ever closer yet remains just beyond grasp." }
  ]
};

// Helper function to detect image requests
const isImageRequest = (message) => {
  const lowerCaseMessage = message.trim().toLowerCase();
  return lowerCaseMessage.includes('/image') ||
         lowerCaseMessage.includes('picture') ||
         lowerCaseMessage.includes('draw') ||
         lowerCaseMessage.includes('generate image');
};

export const chat = async (req, res) => {
  const { message, conversation_id, user_email = 'anonymous' } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required and cannot be empty.' });
  }

  try {
    let convId = conversation_id;
    let currentConversation;

    // If a conversation ID is provided, try to find it
    if (convId) {
      if (!ObjectId.isValid(convId)) {
          console.warn(`Invalid Conversation ID provided: ${convId}. Starting a new one.`);
          convId = null;
      } else {
          currentConversation = await conversations.findOne({ _id: new ObjectId(convId) });
          if (!currentConversation) {
            console.warn(`Conversation with ID ${convId} not found. Starting a new one.`);
            convId = null;
          }
      }
    }

    // Create new conversation if needed (or if provided convId was invalid)
    if (!convId) {
      const result = await conversations.insertOne({
        user_email,
        created_at: new Date(),
        messages: [],
        updated_at: new Date(),
        character: CHARACTER_CONFIG.name,
        characterConfig: CHARACTER_CONFIG
      });
      convId = result.insertedId.toString();
      currentConversation = {
        _id: new ObjectId(convId),
        messages: [],
        user_email,
        characterConfig: CHARACTER_CONFIG
      };
    }

    // Add user message to conversation
    const userMsg = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      isImageRequest: isImageRequest(message)
    };
    await conversations.updateOne(
      { _id: new ObjectId(convId) },
      { $push: { messages: userMsg }, $set: { updated_at: new Date() } }
    );

    currentConversation.messages.push(userMsg);

    // Handle image generation request
    if (userMsg.isImageRequest) {
      const cleanedMessage = message.toLowerCase()
                                   .replace('/image', '')
                                   .replace('picture', '')
                                   .replace('draw', '')
                                   .replace('generate image', '')
                                   .trim();
      const imagePrompt = `In the style of ${CHARACTER_CONFIG.imageStyle}: ${cleanedMessage || 'a mystical scene'}`;

      let imageData;
      let botReplyContent;
      let imageGeneratedSuccessfully = false;
      try {
        imageData = await generateImage(imagePrompt);
        botReplyContent = `As the ancient whispers command, a vision manifests for you.`;
        imageGeneratedSuccessfully = true;
      } catch (imgError) {
        console.error('Failed to generate image:', imgError);
        botReplyContent = "My mystic visions are momentarily clouded. I could not manifest that image for you, seeker. Perhaps another attempt?";
        imageData = null;
      }

      const botReply = {
        role: 'assistant',
        content: botReplyContent,
        timestamp: new Date(),
        image: imageData,
        isImage: imageGeneratedSuccessfully
      };

      await conversations.updateOne(
        { _id: new ObjectId(convId) },
        { $push: { messages: botReply }, $set: { updated_at: new Date() } }
      );

      const updated = await conversations.findOne({ _id: new ObjectId(convId) });

      return res.json({
        response: botReply.content,
        image: botReply.image,
        isImage: botReply.isImage,
        conversation_id: convId,
        history: updated.messages,
        character: CHARACTER_CONFIG.name
      });
    }

    // Create character-specific system prompt
    const systemPrompt = {
      role: 'system',
      content: `You are ${CHARACTER_CONFIG.name}, ${CHARACTER_CONFIG.personality}.
                ${CHARACTER_CONFIG.description}
                ${CHARACTER_CONFIG.backstory}. You ${CHARACTER_CONFIG.speechPattern}.
                Never break character. Respond as if you are this persona.
                
                // If asked for images (e.g., "draw me a picture", "generate image", "/image"),
                // you should acknowledge the request very briefly, like "As you wish, seeker. A vision shall be conjured."
                // DO NOT describe the image content yourself in your text response if it is an image generation request.
                // The actual image will be provided separately by the system, so your text response should be concise.
                
                Here are some example interactions:
                ${CHARACTER_CONFIG.examples.map(e => `${e.role}: ${e.content}`).join('\n')}`
    };

    // Prepare context
    const context = [systemPrompt, ...currentConversation.messages.slice(-6)];

    // Call Groq API
    const response = await groqClient.chat.completions.create({
      model: process.env.GROK_MODEL || 'llama3-8b-8192',
      messages: context.map(m => ({ role: m.role, content: m.content })),
      temperature: 0.7,
      max_tokens: 150
    });

    // Process AI response
    const botReply = {
      role: 'assistant',
      content: response.choices[0].message.content.trim(),
      timestamp: new Date(),
      isImage: false // Explicitly false for text-only responses
    };

    // Store response
    await conversations.updateOne(
      { _id: new ObjectId(convId) },
      { $push: { messages: botReply }, $set: { updated_at: new Date() } }
    );

    const updated = await conversations.findOne({ _id: new ObjectId(convId) });

    res.json({
      response: botReply.content,
      conversation_id: convId,
      history: updated.messages,
      character: CHARACTER_CONFIG.name,
      isImage: false // Explicitly false for text-only responses
    });
  } catch (err) {
    console.error("Error in chat function:", err);
    res.status(500).json({ error: 'An internal server error occurred while processing your request. Please try again.' });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ message: 'User email is required.' });

    const convs = await conversations.find({ user_email: user_id })
      .project({
        messages: { $slice: 1 },
        created_at: 1,
        updated_at: 1,
        character: 1
      })
      .sort({ updated_at: -1 })
      .limit(20)
      .toArray();

    const formatted = convs.map(c => {
      const firstMessage = c.messages?.[0];
      return {
        _id: c._id.toString(),
        created_at: c.created_at.toISOString(),
        updated_at: c.updated_at.toISOString(),
        title: firstMessage?.content || `Chat on ${new Date(c.created_at).toLocaleDateString()}`,
        character: c.character || 'Unknown',
        has_image_as_title: firstMessage?.isImage || false
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Error in getUserConversations:", err);
    res.status(500).json({ error: 'Failed to retrieve user conversations.' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    if (!conversation_id || !ObjectId.isValid(conversation_id)) {
      return res.status(400).json({ message: 'Valid conversation ID is required.' });
    }

    const conv = await conversations.findOne({ _id: new ObjectId(conversation_id) });
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    conv._id = conv._id.toString();
    conv.messages = conv.messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
      isImage: m.isImage || false,
      image: m.image ? m.image.toString('base64') : undefined
    }));
    conv.character = conv.character || CHARACTER_CONFIG.name;

    res.json(conv);
  } catch (err) {
    console.error("Error in getConversation:", err);
    res.status(500).json({ error: 'Failed to retrieve conversation history.' });
  }
};