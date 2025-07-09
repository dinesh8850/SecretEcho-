
# **SecretEcho AI: Your Personalized Chat Experience**

**SecretEcho AI** is a modern, responsive web application that offers a personal and immersive chat experience powered by Groq's AI. With a sleek interface, voice capabilities, and memory persistence, SecretEcho is designed for users seeking more than just casual conversation.

> 🔮 **Featuring Mystic Raven** — an ancient, enigmatic entity who speaks in riddles and metaphors, offers profound guidance, and conjures mystical visions of forgotten realms.

---

## 🌌 Meet Mystic Raven

* **Name**: Mystic Raven
* **Personality**: Mysterious, wise, slightly ominous
* **Backstory**: An ancient being who has seen civilizations rise and fall
* **Speech Pattern**: Riddles and metaphors
* **Image Style**: Mystical fantasy art, dark feathers, glowing eyes, cinematic lighting
* **Description**: *An ancient, enigmatic being who speaks in riddles and metaphors, offering profound insights and guiding seekers through their journeys.*
* **Vision Ability**: Generates AI-powered images that visualize ancient wisdom, forgotten empires, and cosmic prophecies.

---

## ✨ Features

* **Groq AI Integration** – Fast, efficient natural language generation
* **Mystic Raven Persona** – Unique character-driven interactions
* **Image Generation** – Generate mystical fantasy images based on chat prompts or visions
* **Persistent Conversations** – Chats are saved per user for seamless continuity
* **Secure Authentication** – JWT-based login/registration with password hashing
* **Voice Input & Output** – Speak and listen to messages using browser speech tools
* **Responsive UI** – Built with Tailwind CSS, optimized across devices
* **Conversation Manager** – Easily access and switch between current and past chats
* **Error Feedback** – Clear, user-friendly error messages

---

## 🛠️ Tech Stack

### 💻 Frontend (React)

* React, React Router DOM
* Axios
* Tailwind CSS
* Lucide React
* Web Speech API (Speech Recognition & Speech Synthesis)

### 🔧 Backend (Node.js / Express)

* Express.js
* Groq SDK
* MongoDB + Mongoose
* bcryptjs
* jsonwebtoken
* dotenv
* cors

---

## ⚙️ Getting Started

### 📌 Prerequisites

* Node.js (LTS)
* MongoDB (local or Atlas)
* Groq API Key ([Get it from Groq Console](https://console.groq.com))

---

### 📁 Backend Setup

```bash
cd backend
npm install
touch .env
```

Add this to `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/chatdb
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_jwt_secret_key_here
```

Start backend server:

```bash
npm start
```

> Runs at: `http://localhost:3000`

---

### 🖥️ Frontend Setup

```bash
cd frontend
npm install
npm start
```

> Opens at: `http://localhost:5173` (Vite) or `http://localhost:3001` (CRA)

---

## 🧪 Usage

* **Register** → Create your account
* **Login** → Enter credentials
* **Chat** → Begin chatting with Mystic Raven
* **Voice Input** → Use the mic icon to speak
* **Voice Output** → Click the speaker icon to hear responses
* **New Chat** → Start a new thread
* **Past Chats** → Browse chat history from sidebar
* **Vision Prompt** → Ask for a vision: *"Show me the ruins of the first empire"*
* **Logout** → End session securely

---

## 🖼️ Example Interactions

> "Mystic Raven, show me a vision of a forest where time stands still."
> → Generates a mystical image of timeless nature.

> "Speak to me of the future."
> → *"When steel bends and stars fall silent, the new age shall rise from ash."*

---

## 🤝 Contributing

Fork the repo, create issues, or submit pull requests. All contributions are welcome.

---


