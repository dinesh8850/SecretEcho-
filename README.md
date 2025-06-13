SecretEcho AI: Your Personalized Chat Assistant
SecretEcho AI is a modern, responsive web application that provides a personal chat experience powered by Groq's AI. It features a sleek, intuitive UI, voice input/output, and the ability to save and retrieve your past conversations, all secured with a basic authentication system.

Features
AI Chatbot Integration: Powered by Groq's fast and efficient AI models.
Persistent Conversations: Your chat history is saved and linked to your user account, allowing you to pick up where you left off.
User Authentication: Secure login and registration with token-based authentication.
Responsive UI: Beautiful and adaptive design using Tailwind CSS for a seamless experience across devices.
Voice Input (Speech-to-Text): Speak your messages directly to the AI using your browser's speech recognition.
Voice Output (Text-to-Speech): Listen to the AI's responses for a more engaging interaction.
Conversation Management: Start new chats or easily switch between your past conversations from the sidebar.
Error Handling: Clear error messages for login and registration failures.
Technologies Used
Frontend (React)
React: A JavaScript library for building user interfaces.
React Router DOM: For declarative routing within the application.
Axios: Promise-based HTTP client for making API requests.
Tailwind CSS: A utility-first CSS framework for rapid UI development.
Lucide React: A collection of beautiful open-source icons.
Web Speech API: For Speech Recognition (voice input) and Speech Synthesis (voice output).
Backend (Node.js/Express)
Node.js: JavaScript runtime.
Express.js: Fast, unopinionated, minimalist web framework.
Groq SDK: To interact with Groq's AI models.
Mongoose: MongoDB object data modeling (ODM) for Node.js.
MongoDB: NoSQL database for storing user data and chat conversations.
jsonwebtoken: For implementing JWT-based authentication.
bcryptjs: For hashing passwords.
Dotenv: To load environment variables from a .env file.
Cors: Node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
Getting Started
Follow these steps to set up and run SecretEcho AI on your local machine.

Prerequisites
Node.js (LTS version recommended)
MongoDB (Community Edition or MongoDB Atlas account)
Groq API Key (Get one from Groq Console)
1. Backend Setup
Navigate to your backend directory (e.g., backend/).

Bash

# Install dependencies
npm install

# Create a .env file in the backend root and add your environment variables
touch .env
Add the following to your .env file, replacing placeholders with your actual values:

Code snippet

PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatdb # Or your MongoDB Atlas connection string
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_key_here # Use a strong, random string
Start the backend server:

Bash

npm start
The backend server should now be running, typically on http://localhost:3000.

2. Frontend Setup
Navigate to your frontend directory (e.g., frontend/).

Bash

# Install dependencies
npm install
Start the React development server:

Bash

npm start
The frontend application should now open in your browser, typically on http://localhost:3001 or http://localhost:5173 (depending on your React setup, e.g., Create React App or Vite).

Usage
Register: On the initial page, click "Register" to create a new account.
Login: After registering, or if you already have an account, log in using your credentials.
Chat: Once logged in, you'll be directed to the chat interface.
Type your message in the input field and press Enter or click the send button.
Use the microphone icon for voice input.
Click the speaker icon next to AI responses to hear them.
New Chat: Click "New Chat" in the sidebar to start a fresh conversation.
Past Chats: Your past conversations will appear in the sidebar. Click on any conversation to load its history.
Logout: Use the "Logout" button in the sidebar to end your session.

Contributing
Feel free to fork the repository, open issues, or submit pull requests.

License
This project is open-source.
