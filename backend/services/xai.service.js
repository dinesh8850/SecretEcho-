// backend/service/xai.service.js
import { MongoClient } from 'mongodb';

// MongoDB Connection
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatdb'; // Use your MongoDB URI
const client = new MongoClient(uri);

let db;
let conversations;

async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(); // Get the database instance
        conversations = db.collection('conversations'); // Get the 'conversations' collection
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit if database connection fails
    }
}

connectToMongo(); // Connect when the service is imported

// Export the conversations collection
export { conversations };