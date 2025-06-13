// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Send, Bot, User, CornerDownLeft, LogOut, Menu, Mic, Volume2, PlusCircle, MessageSquare } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//     const navigate = useNavigate();
//     const [messages, setMessages] = useState([
//         { role: 'assistant', content: 'Hello! How can I help you today?' }
//     ]);
//     const [inputValue, setInputValue] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [conversationId, setConversationId] = useState(null); // The ID of the currently active conversation
//     // --- UPDATED: Get userEmail from localStorage ---
//     const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'anonymous');
//     // --- END UPDATED ---
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [conversations, setConversations] = useState([]); // List of past conversation summaries
//     const [selectedConversationId, setSelectedConversationId] = useState(null); // ID of the conversation selected in sidebar

//     const chatRef = useRef(null);
//     const recognitionRef = useRef(null);

//     // Effect to scroll chat to bottom
//     useEffect(() => {
//         if (chatRef.current) {
//             chatRef.current.scrollTop = chatRef.current.scrollHeight;
//         }
//     }, [messages, isLoading]);

//     // Effect to initialize SpeechRecognition for voice input
//     useEffect(() => {
//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//         if (SpeechRecognition) {
//             recognitionRef.current = new SpeechRecognition();
//             recognitionRef.current.continuous = false; // Listen for a single utterance
//             recognitionRef.current.interimResults = false; // Only return final results
//             recognitionRef.current.lang = 'en-US'; // Set recognition language

//             recognitionRef.current.onstart = () => {
//                 setIsListening(true);
//                 console.log('Voice recognition started.');
//             };

//             recognitionRef.current.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 setInputValue(transcript); // Set input value to the recognized text
//                 setIsListening(false);
//                 console.log('Transcript:', transcript);
//             };

//             recognitionRef.current.onerror = (event) => {
//                 setIsListening(false);
//                 console.error('Speech recognition error:', event.error);
//                 if (event.error === 'not-allowed') {
//                     // This error occurs if microphone access is denied
//                     alert('Microphone access denied. Please allow microphone access in your browser settings.');
//                 }
//             };

//             recognitionRef.current.onend = () => {
//                 setIsListening(false);
//                 console.log('Voice recognition ended.');
//             };
//         } else {
//             console.warn('Speech Recognition not supported in this browser.');
//         }
//     }, []);

//     // Functions for voice input
//     const startListening = () => {
//         if (recognitionRef.current && !isListening) {
//             try {
//                 recognitionRef.current.start();
//             } catch (e) {
//                 console.error("Error starting speech recognition:", e);
//                 alert("Could not start microphone. Please check your browser's microphone permissions.");
//                 setIsListening(false);
//             }
//         }
//     };

//     const stopListening = () => {
//         if (recognitionRef.current && isListening) {
//             recognitionRef.current.stop();
//             setIsListening(false);
//         }
//     };

//     // Function for text-to-speech output
//     const speakText = (text) => {
//         if ('speechSynthesis' in window) {
//             const utterance = new SpeechSynthesisUtterance(text);
//             utterance.lang = 'en-US'; // Set speech language
//             window.speechSynthesis.speak(utterance);
//         } else {
//             console.warn('Speech Synthesis not supported in this browser.');
//         }
//     };

//     // Fetches the list of all conversations for the user
//     const fetchConversations = useCallback(async () => {
//         // --- UPDATED: Check if userEmail is valid before fetching ---
//         if (userEmail === 'anonymous') {
//             console.warn("Cannot fetch conversations: User email not found. Displaying anonymous chats.");
//             setConversations([]);
//             return;
//         }
//         // --- END UPDATED ---

//         try {
//             // UPDATED URL: Using userEmail as a path parameter
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversations/${userEmail}`);
//             if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
//             const data = await response.json();

//             // Map backend data to frontend's expected format (using last_message as title)
//             const formattedConversations = data.map(conv => ({
//                 id: conv._id, // Use _id from MongoDB as the unique ID
//                 title: conv.last_message || `Chat on ${new Date(conv.created_at).toLocaleDateString()}`, // Use last_message as title
//                 created_at: conv.created_at,
//                 updated_at: conv.updated_at
//             }));
//             setConversations(formattedConversations);

//             // If no conversation is selected and there are past conversations, select the latest one
//             if (formattedConversations.length > 0 && !selectedConversationId) {
//                 setSelectedConversationId(formattedConversations[0].id);
//             }
//         } catch (error) {
//             console.error('Error fetching conversations:', error);
//             // Optionally, set an error message in the UI
//         }
//     }, [userEmail, selectedConversationId]); // --- UPDATED: Added userEmail to dependency array ---

//     // Fetches all messages for a specific conversation
//     const fetchMessagesForConversation = useCallback(async (convId) => {
//         setIsLoading(true);
//         setMessages([]); // Clear current messages while loading history
//         try {
//             // URL remains the same, as it only depends on conversation_id
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversation/${convId}`);
//             if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
//             const data = await response.json();

//             setMessages(data.messages);
//             setConversationId(data._id); // Ensure the internal conversationId is set
//             setSelectedConversationId(data._id); // Ensure the selected ID is set for UI highlighting
//         } catch (error) {
//             console.error('Error fetching messages for conversation:', error);
//             setMessages([{ role: 'assistant', content: 'Could not load chat history for this conversation.' }]);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     // Effect to load conversations on component mount
//     useEffect(() => {
//         fetchConversations();
//     }, [fetchConversations]);

//     // Effect to load messages when a conversation is selected
//     useEffect(() => {
//         if (selectedConversationId) {
//             fetchMessagesForConversation(selectedConversationId);
//         } else {
//             // If no conversation is selected (e.g., initial load or "New Chat" clicked)
//             setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
//             setConversationId(null); // Clear active conversation ID
//         }
//     }, [selectedConversationId, fetchMessagesForConversation]);

//     // Handles starting a new chat session
//     const handleNewChat = () => {
//         setSelectedConversationId(null); // Deselect any active conversation
//         setConversationId(null); // Clear the active conversation ID for new chat
//         setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]); // Reset messages
//         setInputValue(''); // Clear input
//         stopListening(); // Stop mic if active
//         setSidebarOpen(false); // Close sidebar on mobile after new chat
//     };

//     // Handles selecting a conversation from the sidebar history
//     const handleConversationSelect = (convId) => {
//         setSelectedConversationId(convId); // Set selected ID, which triggers message fetch
//         setSidebarOpen(false); // Close sidebar on mobile
//     };

//     // Handles sending a message (text or voice)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!inputValue.trim()) return;

//         const userMessageContent = inputValue;
//         const userMessage = { role: 'user', content: userMessageContent };
//         setMessages(prev => [...prev, userMessage]); // Add user message to UI
//         setInputValue(''); // Clear input field
//         setIsLoading(true); // Show loading indicator
//         stopListening(); // Stop mic if active

//         try {
//             // Call your backend's chat endpoint
//             const response = await fetch('http://127.0.0.1:3000/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     message: userMessageContent,
//                     // --- UPDATED: Send userEmail instead of userId ---
//                     user_email: userEmail, // Changed from user_id to user_email
//                     // --- END UPDATED ---
//                     conversation_id: conversationId, // Will be null for new chats
//                 }),
//             });

//             if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

//             const data = await response.json();
//             const botMessage = { role: 'assistant', content: data.response };
//             setMessages(prev => [...prev, botMessage]); // Add bot's response to UI

//             // If a new conversation was created by the backend, update conversationId and refresh history
//             if (data.conversation_id && data.conversation_id !== conversationId) {
//                 setConversationId(data.conversation_id);
//                 setSelectedConversationId(data.conversation_id); // Select the new conversation in sidebar
//                 fetchConversations(); // Re-fetch conversation list to show the new chat
//             }
//             speakText(data.response); // Speak the bot's response
//         } catch (error) {
//             console.error('Fetch error:', error);
//             setMessages(prev => [...prev, {
//                 role: 'assistant',
//                 content: 'Oops! Something went wrong. Please try again.'
//             }]);
//             speakText('Oops! Something went wrong. Please try again.');
//         } finally {
//             setIsLoading(false); // Hide loading indicator
//         }
//     };

//     // Handles user logout
//     const handleLogout = () => {
//         localStorage.removeItem('token'); // Clear token (if using local storage for auth)
//         localStorage.removeItem('userEmail'); // --- NEW: Clear user email from local storage on logout ---
//         navigate('/login'); // Redirect to login page
//     };

//     return (
//         <div className="flex h-screen text-white font-sans relative">
//             {/* Mobile menu button */}
//             <button
//                 className="sm:hidden absolute top-4 left-4 z-20 bg-indigo-700 p-2 rounded-full shadow-lg"
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//             >
//                 <Menu className="w-5 h-5" />
//             </button>

//             {/* Sidebar */}
//             <aside className={`w-64 bg-gradient-to-b from-purple-800 via-indigo-800 to-indigo-900 p-6 shadow-lg flex flex-col fixed sm:relative h-full z-10 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
//                 <div className="flex items-center gap-3 mb-6">
//                     <div className="bg-yellow-300 w-10 h-10 rounded-full flex items-center justify-center">
//                         <Bot className="w-5 h-5 text-purple-900" />
//                     </div>
//                     <div>
//                         <h2 className="text-lg font-bold">SecretEcho AI</h2>
//                         <p className="text-xs text-gray-300">Your Chat Assistant</p>
//                         {/* --- NEW: Display logged-in user's email --- */}
//                         {userEmail !== 'anonymous' && (
//                             <p className="text-xs text-gray-400 mt-1">Logged in as: {userEmail}</p>
//                         )}
//                         {/* --- END NEW --- */}
//                     </div>
//                 </div>

//                 {/* New Chat Button */}
//                 <button
//                     onClick={handleNewChat}
//                     className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors duration-200 mb-4"
//                 >
//                     <PlusCircle className="w-4 h-4" />
//                     New Chat
//                 </button>

//                 {/* Past Chats History */}
//                 <div className="flex-1 overflow-y-auto pr-2">
//                     <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase">Past Chats</h3>
//                     {conversations.length === 0 ? (
//                         <p className="text-gray-400 text-sm">No past chats yet for {userEmail !== 'anonymous' ? userEmail : 'anonymous users'}.</p>
//                     ) : (
//                         <nav className="space-y-2">
//                             {conversations.map((conv) => (
//                                 <button
//                                     key={conv.id}
//                                     onClick={() => handleConversationSelect(conv.id)}
//                                     className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
//                                         ${selectedConversationId === conv.id ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/50 text-gray-200'}`}
//                                 >
//                                     <MessageSquare className="w-4 h-4" />
//                                     {/* Display the conversation title (last_message from backend) */}
//                                     <span className="text-sm truncate">
//                                         {conv.title}
//                                     </span>
//                                 </button>
//                             ))}
//                         </nav>
//                     )}
//                 </div>

//                 {/* Logout button in sidebar */}
//                 <button
//                     onClick={handleLogout}
//                     className="mt-auto flex items-center gap-2 text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors duration-200"
//                 >
//                     <LogOut className="w-4 h-4" />
//                     Logout
//                 </button>
//             </aside>

//             {/* Overlay for mobile when sidebar is open */}
//             {sidebarOpen && (
//                 <div
//                     className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             {/* Chat Area */}
//             <div className="flex flex-col flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
//                 {/* Header */}
//                 <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 shadow-lg flex items-center justify-between">
//                     <div className="flex items-center">
//                         <Bot className="w-6 h-6 text-yellow-300 mr-2" />
//                         <h1 className="text-xl font-extrabold tracking-wide">SecretEcho AI</h1>
//                     </div>

//                     {/* Mobile logout button (hidden on desktop) */}
//                     <button
//                         onClick={handleLogout}
//                         className="sm:hidden bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors duration-200"
//                     >
//                         <LogOut className="w-5 h-5" />
//                     </button>
//                 </header>

//                 {/* Messages Display */}
//                 <main ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 sm:p-6">
//                     {/* Show loading indicator when fetching initial messages */}
//                     {isLoading && messages.length === 0 ? (
//                          <div className="flex items-center justify-center h-full text-lg text-gray-300">
//                             Loading chat history...
//                          </div>
//                     ) : (
//                         messages.map((msg, index) => (
//                             <div
//                                 key={index}
//                                 className={`flex items-end gap-2 ${
//                                     msg.role === 'user' ? 'justify-end' : 'justify-start'
//                                 } animate-fade-in-up`}
//                             >
//                                 {msg.role === 'assistant' && (
//                                     <>
//                                         <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
//                                             <Bot className="w-4 h-4 text-purple-900" />
//                                         </div>
//                                         <div
//                                             className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
//                                                 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none`}
//                                         >
//                                             <p className="whitespace-pre-wrap">{msg.content}</p>
//                                         </div>
//                                         {/* Play audio button for assistant messages */}
//                                         <button
//                                             onClick={() => speakText(msg.content)}
//                                             className="bg-purple-700 hover:bg-purple-800 p-2 rounded-full text-white ml-1 transition-colors duration-200"
//                                             title="Listen to message"
//                                         >
//                                             <Volume2 className="w-4 h-4" />
//                                         </button>
//                                     </>
//                                 )}
//                                 {msg.role === 'user' && (
//                                     <>
//                                         <div
//                                             className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
//                                                 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-br-none`}
//                                         >
//                                             <p className="whitespace-pre-wrap">{msg.content}</p>
//                                         </div>
//                                         <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
//                                             <User className="w-4 h-4 text-green-900" />
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         ))
//                     )}

//                     {/* Flashing dots loading animation for ongoing AI response */}
//                     {isLoading && messages.length > 0 && (
//                         <div className="flex items-end gap-2 justify-start animate-fade-in-up">
//                             <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
//                                 <Bot className="w-4 h-4 text-purple-900" />
//                             </div>
//                             <div className="p-3 rounded-2xl bg-purple-600 rounded-bl-none flex items-center shadow-md">
//                                 <div className="dot-flashing"></div>
//                             </div>
//                         </div>
//                     )}
//                 </main>

//                 {/* Input Box and Controls */}
//                 <footer className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 border-t border-gray-700">
//                     <form
//                         onSubmit={handleSubmit}
//                         className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 max-w-2xl mx-auto shadow-lg"
//                     >
//                         {/* Microphone Button */}
//                         <button
//                             type="button" // Important: type="button" to prevent form submission
//                             onClick={isListening ? stopListening : startListening}
//                             className={`p-2 rounded-full transition-colors duration-200 ${
//                                 isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
//                             }`}
//                             disabled={isLoading}
//                             title={isListening ? "Stop listening" : "Start voice input"}
//                         >
//                             <Mic className="w-4 h-4 text-white" />
//                         </button>

//                         <input
//                             type="text"
//                             value={inputValue}
//                             onChange={(e) => setInputValue(e.target.value)}
//                             placeholder="Type or speak your message..."
//                             className="flex-1 bg-transparent text-sm text-white placeholder-gray-300 focus:outline-none"
//                             disabled={isLoading}
//                         />
//                         <button
//                             type="submit"
//                             className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 rounded-full p-2 transition"
//                             disabled={isLoading || !inputValue.trim()}
//                         >
//                             <Send className="w-4 h-4 text-purple-900" />
//                         </button>
//                     </form>
//                     <div className="text-center text-xs text-gray-200 pt-2 flex justify-center items-center">
//                         Press <CornerDownLeft className="w-3 h-3 mx-1" /> to send (or use the microphone!)
//                     </div>
//                 </footer>
//             </div>

//             {/* Loading Animation Style */}
//             <style>{`
//                 .dot-flashing {
//                     position: relative;
//                     width: 8px;
//                     height: 8px;
//                     border-radius: 50%;
//                     background-color: #facc15;
//                     animation: dot-flashing 1s infinite linear alternate;
//                 }
//                 .dot-flashing::before,
//                 .dot-flashing::after {
//                     content: '';
//                     position: absolute;
//                     top: 0;
//                     width: 8px;
//                     height: 8px;
//                     border-radius: 50%;
//                     background-color: #facc15;
//                 }
//                 .dot-flashing::before {
//                     left: -12px;
//                     animation: dot-flashing 1s infinite alternate;
//                     animation-delay: 0.2s;
//                 }
//                 .dot-flashing::after {
//                     left: 12px;
//                     animation: dot-flashing 1s infinite alternate;
//                     animation-delay: 0.4s;
//                 }
//                 @keyframes dot-flashing {
//                     0% { background-color: #facc15; }
//                     100% { background-color: #f472b6; }
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default Home;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, CornerDownLeft, LogOut, Menu, Mic, Volume2, PlusCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null); // The ID of the currently active conversation
    const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'anonymous');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [conversations, setConversations] = useState([]); // List of past conversation summaries
    const [selectedConversationId, setSelectedConversationId] = useState(null); // ID of the conversation selected in sidebar

    const chatRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- NEW: Authentication Check ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No authentication token found. Redirecting to login.");
            navigate('/login'); // Redirect to your login page
        }
        // This effect also runs when userEmail is updated, ensuring fetches are triggered correctly
    }, [navigate]); // No userEmail in dependencies as it's set once from localStorage initially

    // If no token is found, render nothing or a loading state while redirecting
    // This prevents the chat UI from flashing before the redirect
    if (!localStorage.getItem('token')) {
        return null; // Or return a loading spinner component
    }
    // --- END NEW ---

    // Effect to scroll chat to bottom
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Effect to initialize SpeechRecognition for voice input
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false; // Listen for a single utterance
            recognitionRef.current.interimResults = false; // Only return final results
            recognitionRef.current.lang = 'en-US'; // Set recognition language

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                console.log('Voice recognition started.');
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript); // Set input value to the recognized text
                setIsListening(false);
                console.log('Transcript:', transcript);
            };

            recognitionRef.current.onerror = (event) => {
                setIsListening(false);
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    // This error occurs if microphone access is denied
                    alert('Microphone access denied. Please allow microphone access in your browser settings.');
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                console.log('Voice recognition ended.');
            };
        } else {
            console.warn('Speech Recognition not supported in this browser.');
        }
    }, []);

    // Functions for voice input
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
                alert("Could not start microphone. Please check your browser's microphone permissions.");
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    // Function for text-to-speech output
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US'; // Set speech language
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn('Speech Synthesis not supported in this browser.');
        }
    };

    // Fetches the list of all conversations for the user
    const fetchConversations = useCallback(async () => {
        // --- UPDATED: Check if userEmail is valid before fetching ---
        if (userEmail === 'anonymous') {
            console.warn("Cannot fetch conversations: User email not found. Displaying anonymous chats.");
            setConversations([]);
            return;
        }
        // --- END UPDATED ---

        try {
            // UPDATED URL: Using userEmail as a path parameter
            const response = await fetch(`http://127.0.0.1:3000/chat/conversations/${userEmail}`);
            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
            const data = await response.json();

            // Map backend data to frontend's expected format (using last_message as title)
            const formattedConversations = data.map(conv => ({
                id: conv._id, // Use _id from MongoDB as the unique ID
                title: conv.messages?.[0]?.content || `Chat on ${new Date(conv.created_at).toLocaleDateString()}`, // Use last_message as title
                created_at: conv.created_at,
                updated_at: conv.updated_at
            }));
            setConversations(formattedConversations);

            // If no conversation is selected and there are past conversations, select the latest one
            if (formattedConversations.length > 0 && !selectedConversationId) {
                setSelectedConversationId(formattedConversations[0].id);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            // Optionally, set an error message in the UI
        }
    }, [userEmail, selectedConversationId]); // --- UPDATED: Added userEmail to dependency array ---

    // Fetches all messages for a specific conversation
    const fetchMessagesForConversation = useCallback(async (convId) => {
        setIsLoading(true);
        setMessages([]); // Clear current messages while loading history
        try {
            // URL remains the same, as it only depends on conversation_id
            const response = await fetch(`http://127.0.0.1:3000/chat/conversation/${convId}`);
            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
            const data = await response.json();

            setMessages(data.messages);
            setConversationId(data._id); // Ensure the internal conversationId is set
            setSelectedConversationId(data._id); // Ensure the selected ID is set for UI highlighting
        } catch (error) {
            console.error('Error fetching messages for conversation:', error);
            setMessages([{ role: 'assistant', content: 'Could not load chat history for this conversation.' }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to load conversations on component mount
    useEffect(() => {
        // Only fetch conversations if a user email is available (i.e., not anonymous)
        if (userEmail !== 'anonymous') {
            fetchConversations();
        }
    }, [fetchConversations, userEmail]); // Added userEmail to dependencies for this effect too

    // Effect to load messages when a conversation is selected
    useEffect(() => {
        if (selectedConversationId) {
            fetchMessagesForConversation(selectedConversationId);
        } else {
            // If no conversation is selected (e.g., initial load or "New Chat" clicked)
            setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
            setConversationId(null); // Clear active conversation ID
        }
    }, [selectedConversationId, fetchMessagesForConversation]);

    // Handles starting a new chat session
    const handleNewChat = () => {
        setSelectedConversationId(null); // Deselect any active conversation
        setConversationId(null); // Clear the active conversation ID for new chat
        setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]); // Reset messages
        setInputValue(''); // Clear input
        stopListening(); // Stop mic if active
        setSidebarOpen(false); // Close sidebar on mobile after new chat
    };

    // Handles selecting a conversation from the sidebar history
    const handleConversationSelect = (convId) => {
        setSelectedConversationId(convId); // Set selected ID, which triggers message fetch
        setSidebarOpen(false); // Close sidebar on mobile
    };

    // Handles sending a message (text or voice)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessageContent = inputValue;
        const userMessage = { role: 'user', content: userMessageContent };
        setMessages(prev => [...prev, userMessage]); // Add user message to UI
        setInputValue(''); // Clear input field
        setIsLoading(true); // Show loading indicator
        stopListening(); // Stop mic if active

        try {
            // Call your backend's chat endpoint
            const response = await fetch('http://127.0.0.1:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessageContent,
                    user_email: userEmail, // Sending userEmail
                    conversation_id: conversationId, // Will be null for new chats
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

            const data = await response.json();
            const botMessage = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, botMessage]); // Add bot's response to UI

            // If a new conversation was created by the backend, update conversationId and refresh history
            if (data.conversation_id && data.conversation_id !== conversationId) {
                setConversationId(data.conversation_id);
                setSelectedConversationId(data.conversation_id); // Select the new conversation in sidebar
                fetchConversations(); // Re-fetch conversation list to show the new chat
            }
            speakText(data.response); // Speak the bot's response
        } catch (error) {
            console.error('Fetch error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Oops! Something went wrong. Please try again.'
            }]);
            speakText('Oops! Something went wrong. Please try again.');
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Handles user logout
    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear token (if using local storage for auth)
        localStorage.removeItem('userEmail'); // Clear user email from local storage on logout
        navigate('/login'); // Redirect to login page
    };

    return (
        <div className="flex h-screen text-white font-sans relative">
            {/* Mobile menu button */}
            <button
                className="sm:hidden absolute top-4 left-4 z-20 bg-indigo-700 p-2 rounded-full shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside className={`w-64 bg-gradient-to-b from-purple-800 via-indigo-800 to-indigo-900 p-6 shadow-lg flex flex-col fixed sm:relative h-full z-10 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-300 w-10 h-10 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-purple-900" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">SecretEcho AI</h2>
                        <p className="text-xs text-gray-300">Your Chat Assistant</p>
                        {/* Display logged-in user's email */}
                        {userEmail !== 'anonymous' && (
                            <p className="text-xs text-gray-400 mt-1">Logged in as: {userEmail}</p>
                        )}
                    </div>
                </div>

                {/* New Chat Button */}
                <button
                    onClick={handleNewChat}
                    className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors duration-200 mb-4"
                >
                    <PlusCircle className="w-4 h-4" />
                    New Chat
                </button>

                {/* Past Chats History */}
                <div className="flex-1 overflow-y-auto pr-2">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase">Past Chats</h3>
                    {conversations.length === 0 ? (
                        <p className="text-gray-400 text-sm">No past chats yet for {userEmail !== 'anonymous' ? userEmail : 'anonymous users'}.</p>
                    ) : (
                        <nav className="space-y-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleConversationSelect(conv.id)}
                                    className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
                                        ${selectedConversationId === conv.id ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/50 text-gray-200'}`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {/* Display the conversation title (last_message from backend) */}
                                    <span className="text-sm truncate">
                                        {conv.title}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Logout button in sidebar */}
                <button
                    onClick={handleLogout}
                    className="mt-auto flex items-center gap-2 text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Chat Area */}
            <div className="flex flex-col flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                {/* Header */}
                <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                        <Bot className="w-6 h-6 text-yellow-300 mr-2" />
                        <h1 className="text-xl font-extrabold tracking-wide">SecretEcho AI</h1>
                    </div>

                    {/* Mobile logout button (hidden on desktop) */}
                    <button
                        onClick={handleLogout}
                        className="sm:hidden bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                {/* Messages Display */}
                <main ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 sm:p-6">
                    {/* Show loading indicator when fetching initial messages */}
                    {isLoading && messages.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-lg text-gray-300">
                            Loading chat history...
                         </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-end gap-2 ${
                                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                                } animate-fade-in-up`}
                            >
                                {msg.role === 'assistant' && (
                                    <>
                                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-purple-900" />
                                        </div>
                                        <div
                                            className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
                                                bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        {/* Play audio button for assistant messages */}
                                        <button
                                            onClick={() => speakText(msg.content)}
                                            className="bg-purple-700 hover:bg-purple-800 p-2 rounded-full text-white ml-1 transition-colors duration-200"
                                            title="Listen to message"
                                        >
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                                {msg.role === 'user' && (
                                    <>
                                        <div
                                            className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
                                                bg-gradient-to-br from-green-400 to-green-600 text-white rounded-br-none`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-green-900" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}

                    {/* Flashing dots loading animation for ongoing AI response */}
                    {isLoading && messages.length > 0 && (
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

                {/* Input Box and Controls */}
                <footer className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-4 border-t border-gray-700">
                    <form
                        onSubmit={handleSubmit}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 max-w-2xl mx-auto shadow-lg"
                    >
                        {/* Microphone Button */}
                        <button
                            type="button" // Important: type="button" to prevent form submission
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-full transition-colors duration-200 ${
                                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            disabled={isLoading}
                            title={isListening ? "Stop listening" : "Start voice input"}
                        >
                            <Mic className="w-4 h-4 text-white" />
                        </button>

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type or speak your message..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-300 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 rounded-full p-2 transition"
                            disabled={isLoading || !inputValue.trim()}
                        >
                            <Send className="w-4 h-4 text-purple-900" />
                        </button>
                    </form>
                    <div className="text-center text-xs text-gray-200 pt-2 flex justify-center items-center">
                        Press <CornerDownLeft className="w-3 h-3 mx-1" /> to send (or use the microphone!)
                    </div>
                </footer>
            </div>

            {/* Loading Animation Style */}
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
};

export default Home;