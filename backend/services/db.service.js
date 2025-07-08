// backend/services/db.service.js
import { MongoClient } from 'mongodb';
import { OpenAI } from 'openai';

const requiredEnvVars = ['XAI_API_KEY', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const xaiClient = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  retryWrites: true,
  w: 'majority',
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

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

connectToMongo().catch((error) => {
  console.error('Failed to initialize MongoDB connection:', error);
  process.exit(1);
});

export { xaiClient, conversations };