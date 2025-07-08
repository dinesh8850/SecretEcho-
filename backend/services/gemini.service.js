import { MongoClient } from 'mongodb';

// For free API access (unofficial approach)
const fetchGeminiResponse = async (messages) => {
  try {
    const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const API_KEY = process.env.GEMINI_API_KEY; // Your API key
    
    const response = await fetch(`${API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages
      })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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

export { fetchGeminiResponse, conversations };