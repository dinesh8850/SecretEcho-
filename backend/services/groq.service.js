import { MongoClient } from 'mongodb';
import Groq from 'groq-sdk';
import axios from 'axios'; // For image generation API calls

// Initialize Groq Client
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Image Generation Service (example using Stability AI)
const generateImage = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
        },
      }
    );
    return response.data.artifacts[0].base64;
  } catch (error) {
    console.error('Image generation error:', error);
      console.error('Image generation error:', error); // Check for this specific error messag
    throw error;
  }
};

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatdb';
const client = new MongoClient(uri);

let db;
let conversations;

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db();
    conversations = db.collection('conversations');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connectToMongo();

export { groqClient, conversations, generateImage };