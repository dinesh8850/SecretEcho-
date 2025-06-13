// import React, { useState } from "react";
// import MessageInput from "../components/MessageInput";
// import VoiceRecorder from "../components/VoiceRecorder";
// import { sendMessageToAI } from "../services/api";
// import { Bot, CornerDownLeft } from "lucide-react";

// // ✅ Define the message type
// type Message = {
//   text: string;
//   sender: "user" | "ai";
// };

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [isLoading, setIsLoading] = useState(false);

//   const token = localStorage.getItem("token") ?? "";

//   const speak = (text: string) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(utterance);
//   };

//   const handleSend = async (text: string) => {
//     const userMsg = { text, sender: "user" as const };
//     setMessages((prev) => [...prev, userMsg]);
//     setIsLoading(true);

//     try {
//       const aiRes = await sendMessageToAI(text, token);
//       const aiMsg = { text: aiRes.reply, sender: "ai" as const };
//       setMessages((prev) => [...prev, aiMsg]);
//       speak(aiRes.reply);
//     } catch (error) {
//       console.error("Failed to get AI reply:", error);
//       setMessages((prev) => [
//         ...prev,
//         { text: "Sorry, something went wrong.", sender: "ai" as const },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVoiceStop = async (blob: Blob) => {
//     // Integrate Whisper API or browser STT if needed
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans">
//       {/* Header */}
//       <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 shadow-lg flex items-center justify-center">
//         <Bot className="w-6 h-6 text-yellow-300 mr-2" />
//         <h1 className="text-xl font-extrabold tracking-wide">Colorful Chatbot</h1>
//       </header>

//       {/* Chat Window */}
//       <main className="flex-1 overflow-y-auto p-4 space-y-4 sm:p-6">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex items-end gap-2 ${
//               msg.sender === "user" ? "justify-end" : "justify-start"
//             } animate-fade-in-up`}
//           >
//             {msg.sender === "ai" && (
//               <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
//                 <Bot className="w-4 h-4 text-purple-900" />
//               </div>
//             )}
//             <div
//               className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg ${
//                 msg.sender === "user"
//                   ? "bg-gradient-to-br from-green-400 to-green-600 text-white rounded-br-none"
//                   : "bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none"
//               }`}
//             >
//               <p className="whitespace-pre-wrap">{msg.text}</p>
//             </div>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="flex items-end gap-2 justify-start animate-fade-in-up">
//             <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
//               <Bot className="w-4 h-4 text-purple-900" />
//             </div>
//             <div className="p-3 rounded-2xl bg-purple-600 rounded-bl-none flex items-center shadow-md">
//               <div className="dot-flashing"></div>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Input & Voice Recorder */}
//       <footer className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 border-t border-gray-700">
//         <div className="flex flex-col gap-2 max-w-2xl mx-auto">
//           <MessageInput onSend={handleSend} />
//           <VoiceRecorder onStop={handleVoiceStop} />
//         </div>
//         <div className="text-center text-xs text-gray-200 pt-2 flex justify-center items-center">
//           Press <CornerDownLeft className="w-3 h-3 mx-1" /> to send
//         </div>
//       </footer>

//       {/* Loading Animation */}
//       <style>{`
//         .dot-flashing {
//           position: relative;
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background-color: #facc15;
//           animation: dot-flashing 1s infinite linear alternate;
//         }
//         .dot-flashing::before,
//         .dot-flashing::after {
//           content: '';
//           position: absolute;
//           top: 0;
//           width: 8px;
//           height: 8px;
//           border-radius: 50%;
//           background-color: #facc15;
//         }
//         .dot-flashing::before {
//           left: -12px;
//           animation: dot-flashing 1s infinite alternate;
//           animation-delay: 0.2s;
//         }
//         .dot-flashing::after {
//           left: 12px;
//           animation: dot-flashing 1s infinite alternate;
//           animation-delay: 0.4s;
//         }
//         @keyframes dot-flashing {
//           0% { background-color: #facc15; }
//           100% { background-color: #f472b6; }
//         }
//       `}</style>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import MessageInput from "../components/MessageInput";
import VoiceRecorder from "../components/VoiceRecorder";
import { sendMessageToAI } from "../services/api";
import { Bot, CornerDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

// ✅ Define the message type
type Message = {
  text: string;
  sender: "user" | "ai";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Initialize navigate hook
  const token = localStorage.getItem("token") ?? ""; // Get token from localStorage

  // --- Authentication Check (IMPORTANT ADDITION) ---
  useEffect(() => {
    // Check if the token exists. If not, redirect to the login page.
    // In a real application, you might also want to validate the token's expiry
    // by making a backend request.
    if (!token) {
      console.warn("No authentication token found. Redirecting to login.");
      navigate("/login");
    }
  }, [token, navigate]); // Rerun if token or navigate changes
  // --- END IMPORTANT ADDITION ---

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  const handleSend = async (text: string) => {
    const userMsg = { text, sender: "user" as const };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiRes = await sendMessageToAI(text, token);
      const aiMsg = { text: aiRes.reply, sender: "ai" as const };
      setMessages((prev) => [...prev, aiMsg]);
      speak(aiRes.reply);
    } catch (error) {
      console.error("Failed to get AI reply:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", sender: "ai" as const },
      ]);
      // Optional: If the error is due to an invalid token, redirect to login
      // if (error.response && error.response.status === 401) {
      //   navigate("/login");
      // }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceStop = async (blob: Blob) => {
    // Integrate Whisper API or browser STT if needed
  };

  // If the token is not present, don't render the chat interface yet.
  // The useEffect hook will handle the redirection.
  if (!token) {
    return null; // Or a loading spinner, or a message like "Redirecting..."
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 shadow-lg flex items-center justify-center">
        <Bot className="w-6 h-6 text-yellow-300 mr-2" />
        <h1 className="text-xl font-extrabold tracking-wide">Colorful Chatbot</h1>
      </header>

      {/* Chat Window */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 sm:p-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            {msg.sender === "ai" && (
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-purple-900" />
              </div>
            )}
            <div
              className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-green-400 to-green-600 text-white rounded-br-none"
                  : "bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-2 justify-start animate-fade-in-up">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-purple-900" />
            </div>
            <div className="p-3 rounded-2xl bg-purple-600 rounded-bl-none flex items-center shadow-md">
              <div className="dot-flashing"></div>
            </div>
          </div>
        )}
      </main>

      {/* Input & Voice Recorder */}
      <footer className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 border-t border-gray-700">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto">
          <MessageInput onSend={handleSend} />
          <VoiceRecorder onStop={handleVoiceStop} />
        </div>
        <div className="text-center text-xs text-gray-200 pt-2 flex justify-center items-center">
          Press <CornerDownLeft className="w-3 h-3 mx-1" /> to send
        </div>
      </footer>

      {/* Loading Animation */}
      <style>{`
        .dot-flashing {
          position: relative;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #facc15;
          animation: dot-flashing 1s infinite linear alternate;
        }
        .dot-flashing::before,
        .dot-flashing::after {
          content: '';
          position: absolute;
          top: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #facc15;
        }
        .dot-flashing::before {
          left: -12px;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0.2s;
        }
        .dot-flashing::after {
          left: 12px;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0.4s;
        }
        @keyframes dot-flashing {
          0% { background-color: #facc15; }
          100% { background-color: #f472b6; }
        }
      `}</style>
    </div>
  );
}