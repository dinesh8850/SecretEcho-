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
// 
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Send, Bot, User, CornerDownLeft, LogOut, Menu, Mic, PlusCircle, MessageSquare, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//     const navigate = useNavigate();
//     const [messages, setMessages] = useState([
//         { role: 'assistant', content: 'Hello! How can I help you today?' }
//     ]);
//     const [inputValue, setInputValue] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [conversationId, setConversationId] = useState(null);
//     const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'anonymous');
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [conversations, setConversations] = useState([]);
//     const [selectedConversationId, setSelectedConversationId] = useState(null);

//     const chatRef = useRef(null);
//     const recognitionRef = useRef(null);

//     // --- Authentication Check ---
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.warn("No authentication token found. Redirecting to login.");
//             navigate('/login');
//         }
//     }, [navigate]);

//     // This check ensures the component doesn't render if there's no token,
//     // preventing issues if navigate takes a moment to redirect.
//     if (!localStorage.getItem('token')) {
//         return null;
//     }

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
//             recognitionRef.current.interimResults = false; // Only final results
//             recognitionRef.current.lang = 'en-US'; // Set language

//             recognitionRef.current.onstart = () => {
//                 setIsListening(true);
//                 console.log('Voice recognition started.');
//             };

//             recognitionRef.current.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 setInputValue(transcript);
//                 setIsListening(false);
//                 console.log('Transcript:', transcript);
//                 // Optionally, automatically submit after voice input if desired
//                 // handleSubmit({ preventDefault: () => {} });
//             };

//             recognitionRef.current.onerror = (event) => {
//                 setIsListening(false);
//                 console.error('Speech recognition error:', event.error);
//                 if (event.error === 'not-allowed') {
//                     alert('Microphone access denied. Please allow microphone access in your browser settings.');
//                 } else {
//                     alert(`Speech recognition error: ${event.error}. Please try again.`);
//                 }
//             };

//             recognitionRef.current.onend = () => {
//                 setIsListening(false);
//                 console.log('Voice recognition ended.');
//             };
//         } else {
//             console.warn('Speech Recognition not supported in this browser.');
//             // Disable mic button or show a message
//         }
//     }, []);

//     // Functions for voice input
//     const startListening = () => {
//         if (recognitionRef.current && !isListening) {
//             setInputValue(''); // Clear previous input when starting to listen
//             try {
//                 recognitionRef.current.start();
//             } catch (e) {
//                 console.error("Error starting speech recognition:", e);
//                 alert("Could not start microphone. Please check your browser's microphone permissions or if another application is using it.");
//                 setIsListening(false);
//             }
//         }
//     };

//     const stopListening = () => {
//         if (recognitionRef.current && isListening) {
//             recognitionRef.current.stop();
//             // setIsListening(false) is handled by onend event
//         }
//     };

//     // Helper function to detect image requests (for frontend cleaning)
//     const isImageRequest = (message) => {
//         const lowerCaseMessage = message.trim().toLowerCase();
//         return lowerCaseMessage.includes('/image') ||
//                lowerCaseMessage.includes('picture') ||
//                lowerCaseMessage.includes('draw') ||
//                lowerCaseMessage.includes('generate image');
//     };

//     // Fetches the list of all conversations for the user
//     const fetchConversations = useCallback(async () => {
//         if (!userEmail || userEmail === 'anonymous') {
//             console.warn("Cannot fetch conversations: User email not found or is anonymous. Displaying anonymous chat only.");
//             setConversations([]);
//             return;
//         }

//         try {
//             // Using template literals for URL construction
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversations/${userEmail}`);
//             if (!response.ok) {
//                 // More specific error for network issues vs. server errors
//                 throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             // Using the 'title' and 'has_image_as_title' from backend
//             const formattedConversations = data.map(conv => ({
//                 id: conv._id,
//                 title: conv.title, // Now using the title provided by the backend
//                 created_at: conv.created_at,
//                 updated_at: conv.updated_at,
//                 has_image_as_title: conv.has_image_as_title // Prop from backend
//             }));
//             setConversations(formattedConversations);

//             // If no conversation is currently selected, select the most recent one
//             if (formattedConversations.length > 0 && !selectedConversationId) {
//                 setSelectedConversationId(formattedConversations[0].id);
//             }
//         } catch (error) {
//             console.error('Error fetching conversations:', error);
//             // Optionally set an error state for UI display
//         }
//     }, [userEmail, selectedConversationId]); // Depend on selectedConversationId to re-fetch if needed

//     // Fetches all messages for a specific conversation
//     const fetchMessagesForConversation = useCallback(async (convId) => {
//         setIsLoading(true);
//         setMessages([]); // Clear messages while loading new conversation
//         try {
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversation/${convId}`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch conversation history: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             // Backend already provides 'messages' array directly, including 'isImage' and 'image' (base64) properties
//             setMessages(data.messages);
//             setConversationId(data._id); // Update the current conversation ID
//             setSelectedConversationId(data._id); // Ensure selected ID is in sync
//         } catch (error) {
//             console.error('Error fetching messages for conversation:', error);
//             setMessages([{ role: 'assistant', content: 'Could not load chat history for this conversation. Please try a new chat.' }]);
//             // Reset conversationId if loading failed
//             setConversationId(null);
//             setSelectedConversationId(null);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []); // No specific dependencies that would cause infinite loop here, convId is passed as arg

//     // Effect to load conversations on component mount and when userEmail changes
//     useEffect(() => {
//         if (userEmail && userEmail !== 'anonymous') {
//             fetchConversations();
//         } else {
//             // For anonymous users, clear conversations and reset chat
//             setConversations([]);
//             // Avoid calling handleNewChat (which uses hooks) inside useEffect, just reset state directly
//             setSelectedConversationId(null);
//             setConversationId(null);
//             setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
//             setInputValue('');
//             stopListening();
//             setSidebarOpen(false);
//         }
//     }, [fetchConversations, userEmail]);

//     // Effect to load messages when a conversation is selected (or deselected for new chat)
//     useEffect(() => {
//         if (selectedConversationId) {
//             fetchMessagesForConversation(selectedConversationId);
//         } else {
//             // This path is for "New Chat" or when no conversation is selected
//             setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
//             setConversationId(null); // Explicitly clear conversationId
//         }
//     }, [selectedConversationId, fetchMessagesForConversation]);

//     // Handles starting a new chat session
//     const handleNewChat = () => {
//         setSelectedConversationId(null); // Deselects any active conversation
//         setConversationId(null); // Clears the current conversation ID
//         setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?' }]);
//         setInputValue('');
//         stopListening(); // Stop any active listening session
//         setSidebarOpen(false); // Close sidebar on mobile
//         // Re-fetch conversations to ensure "New Chat" is not mistakenly seen as existing
//         fetchConversations();
//     };

//     // Handles selecting a conversation from the sidebar history
//     const handleConversationSelect = (convId) => {
//         if (convId === selectedConversationId) {
//             setSidebarOpen(false); // Just close sidebar if same conv is clicked
//             return;
//         }
//         setSelectedConversationId(convId);
//         setSidebarOpen(false); // Close sidebar on mobile
//     };

//     // Handles sending a message (text or voice)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const trimmedInputValue = inputValue.trim();

//         if (!trimmedInputValue) return; // Prevent sending empty messages

//         // Determine if it's an image request for frontend logic (not for backend communication)
//         const isImageReqClient = isImageRequest(trimmedInputValue);

//         let messageToSendToBackend = trimmedInputValue;
//         // Optional: Clean keywords from message if it's an image request for backend
//         // The backend already handles this, but it can be done here too for clarity/minor optimization
//         if (isImageReqClient) {
//             messageToSendToBackend = trimmedInputValue
//                                       .toLowerCase()
//                                       .replace('/image', '')
//                                       .replace('picture', '')
//                                       .replace('draw', '')
//                                       .replace('generate image', '')
//                                       .trim();
//             // Fallback for empty prompt after cleaning
//             if (!messageToSendToBackend) {
//                 messageToSendToBackend = "a captivating image"; // Default prompt for image generation
//             }
//         }

//         // Add user's message to the display immediately
//         const userMessage = { role: 'user', content: trimmedInputValue, isImageRequest: isImageReqClient };
//         setMessages(prev => [...prev, userMessage]);
//         setInputValue(''); // Clear input after sending
//         setIsLoading(true); // Show loading indicator
//         stopListening(); // Stop listening if voice input was active

//         try {
//             const response = await fetch('http://127.0.0.1:3000/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     message: messageToSendToBackend, // Use potentially cleaned message
//                     user_email: userEmail,
//                     conversation_id: conversationId, // Will be null for new chats
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();

//             // Process AI response: directly use `data.isImage` from backend
//             const botMessage = {
//                 role: 'assistant',
//                 content: data.response,
//                 image: data.image, // Will be base64 string if an image
//                 isImage: data.isImage || false // Rely on backend's boolean, default to false
//             };
//             setMessages(prev => [...prev, botMessage]);

//             // If it's a new conversation or the ID changed, update states and refetch sidebar
//             if (data.conversation_id && data.conversation_id !== conversationId) {
//                 setConversationId(data.conversation_id);
//                 setSelectedConversationId(data.conversation_id); // Keep selected ID in sync
//                 fetchConversations(); // Update sidebar with new conversation
//             } else {
//                 // If it's an existing conversation, just update its 'updated_at' in the sidebar
//                 // by re-fetching conversations, which will resort them correctly.
//                 fetchConversations();
//             }
//         } catch (error) {
//             console.error('Fetch error during chat:', error);
//             setMessages(prev => [...prev, {
//                 role: 'assistant',
//                 content: 'Oops! My connection to the mystic realms is disturbed. Please try again.'
//             }]);
//         } finally {
//             setIsLoading(false); // Hide loading indicator
//         }
//     };

//     // Handles user logout
//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('userEmail');
//         navigate('/login');
//     };

//     // Define trimmedInputValue for use in the render
//     const trimmedInputValue = inputValue.trim();

//     return (
//         <div className="flex h-screen text-white font-sans relative">
//             {/* Mobile menu button */}
//             <button
//                 className="sm:hidden absolute top-4 left-4 z-20 bg-indigo-700 p-2 rounded-full shadow-lg"
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 aria-label="Toggle sidebar menu"
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
//                         {userEmail !== 'anonymous' && (
//                             <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={userEmail}>Logged in as: {userEmail}</p>
//                         )}
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
//                         <p className="text-gray-400 text-sm">
//                             {userEmail !== 'anonymous' ? 'No past chats yet. Start a new conversation!' : 'No past chats. Messages for anonymous users are not saved.'}
//                         </p>
//                     ) : (
//                         <nav className="space-y-2">
//                             {conversations.map((conv) => (
//                                 <button
//                                     key={conv.id}
//                                     onClick={() => handleConversationSelect(conv.id)}
//                                     className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
//                                         ${selectedConversationId === conv.id ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/50 text-gray-200'}`}
//                                 >
//                                     <MessageSquare className="w-4 h-4 flex-shrink-0" />
//                                     <span className="text-sm truncate flex-grow">
//                                         {conv.title}
//                                     </span>
//                                     {conv.has_image_as_title && (
//                                        <ImageIcon className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" title="Started with an image" />
//                                     )}
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
//                     aria-hidden="true" // Indicate it's for visual effect, not interactive
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
//                         aria-label="Logout"
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
//                                 key={index} // Consider using msg._id for better unique key if available in messages array
//                                 className={`flex items-end gap-2 ${
//                                     msg.role === 'user' ? 'justify-end' : 'justify-start'
//                                 } animate-fade-in-up`}
//                             >
//                                 {msg.role === 'assistant' && (
//                                     <>
//                                         <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
//                                             <Bot className="w-4 h-4 text-purple-900" />
//                                         </div>
//                                         <div
//                                             className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
//                                                 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none`}
//                                         >
//                                             {msg.isImage && msg.image ? (
//                                                 <>
//                                                     {/* Display text content if present, above the image */}
//                                                     {msg.content && (
//                                                         <p className="whitespace-pre-wrap mb-2 text-gray-100 italic">
//                                                             {msg.content}
//                                                         </p>
//                                                     )}
//                                                     <img
//                                                         src={`data:image/png;base64,${msg.image}`} // Assuming PNG from Stability AI
//                                                         alt={msg.content || "Generated AI Image"} // Use content as alt text if available
//                                                         className="mt-2 rounded-lg max-w-full h-auto"
//                                                         style={{ maxWidth: '100%', height: 'auto' }} // Explicit styling for images
//                                                     />
//                                                 </>
//                                             ) : (
//                                                 // Regular text message
//                                                 <p className="whitespace-pre-wrap">{msg.content}</p>
//                                             )}
//                                         </div>
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
//                                         <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
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
//                             type="button"
//                             onClick={isListening ? stopListening : startListening}
//                             className={`p-2 rounded-full transition-colors duration-200 ${
//                                 isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
//                             }`}
//                             disabled={isLoading || (recognitionRef.current === null)} // Disable if not supported
//                             title={isListening ? "Stop listening" : (recognitionRef.current ? "Start voice input" : "Voice input not supported")}
//                             aria-label={isListening ? "Stop voice input" : "Start voice input"}
//                         >
//                             <Mic className="w-4 h-4 text-white" />
//                         </button>

//                         <input
//                             id="chat-input" // Added ID for accessibility
//                             type="text"
//                             value={inputValue}
//                             onChange={(e) => setInputValue(e.target.value)}
//                             placeholder="Type or speak your message..."
//                             className="flex-1 bg-transparent text-sm text-white placeholder-gray-300 focus:outline-none"
//                             disabled={isLoading}
//                             aria-label="Type your message" // Added aria-label for accessibility
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line
//                                     handleSubmit(e);
//                                 }
//                             }}
//                         />
//                         <button
//                             type="submit"
//                             className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 rounded-full p-2 transition"
//                             disabled={isLoading || !trimmedInputValue} // Use trimmedInputValue
//                             aria-label="Send message"
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
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Send, Bot, User, CornerDownLeft, LogOut, Menu, Mic, PlusCircle, MessageSquare, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
// import { useNavigate } from 'react-router-dom';

// const Home = () => {
//     const navigate = useNavigate();
//     const [messages, setMessages] = useState([
//         { role: 'assistant', content: 'Hello! How can I help you today?', isImage: false } // Explicitly set isImage
//     ]);
//     const [inputValue, setInputValue] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [conversationId, setConversationId] = useState(null);
//     const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'anonymous');
//     const [sidebarOpen, setSidebarOpen] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [conversations, setConversations] = useState([]);
//     const [selectedConversationId, setSelectedConversationId] = useState(null);

//     const chatRef = useRef(null);
//     const recognitionRef = useRef(null);

//     // --- Authentication Check ---
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.warn("No authentication token found. Redirecting to login.");
//             navigate('/login');
//         }
//     }, [navigate]);

//     // This check ensures the component doesn't render if there's no token,
//     // preventing issues if navigate takes a moment to redirect.
//     if (!localStorage.getItem('token')) {
//         return null;
//     }

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
//             recognitionRef.current.interimResults = false; // Only final results
//             recognitionRef.current.lang = 'en-US'; // Set language

//             recognitionRef.current.onstart = () => {
//                 setIsListening(true);
//                 console.log('Voice recognition started.');
//             };

//             recognitionRef.current.onresult = (event) => {
//                 const transcript = event.results[0][0].transcript;
//                 setInputValue(transcript);
//                 setIsListening(false);
//                 console.log('Transcript:', transcript);
//                 // Optionally, automatically submit after voice input if desired
//                 // handleSubmit({ preventDefault: () => {} });
//             };

//             recognitionRef.current.onerror = (event) => {
//                 setIsListening(false);
//                 console.error('Speech recognition error:', event.error);
//                 if (event.error === 'not-allowed') {
//                     alert('Microphone access denied. Please allow microphone access in your browser settings.');
//                 } else {
//                     alert(`Speech recognition error: ${event.error}. Please try again.`);
//                 }
//             };

//             recognitionRef.current.onend = () => {
//                 setIsListening(false);
//                 console.log('Voice recognition ended.');
//             };
//         } else {
//             console.warn('Speech Recognition not supported in this browser.');
//             // Disable mic button or show a message
//         }
//     }, []);

//     // Functions for voice input
//     const startListening = () => {
//         if (recognitionRef.current && !isListening) {
//             setInputValue(''); // Clear previous input when starting to listen
//             try {
//                 recognitionRef.current.start();
//             } catch (e) {
//                 console.error("Error starting speech recognition:", e);
//                 alert("Could not start microphone. Please check your browser's microphone permissions or if another application is using it.");
//                 setIsListening(false);
//             }
//         }
//     };

//     const stopListening = () => {
//         if (recognitionRef.current && isListening) {
//             recognitionRef.current.stop();
//             // setIsListening(false) is handled by onend event
//         }
//     };

//     // Helper function to detect image requests (for frontend cleaning)
//     const isImageRequestClient = (message) => { // Renamed to avoid conflict with backend's isImageRequest
//         const lowerCaseMessage = message.trim().toLowerCase();
//         return lowerCaseMessage.includes('/image') ||
//                lowerCaseMessage.includes('picture') ||
//                lowerCaseMessage.includes('draw') ||
//                lowerCaseMessage.includes('generate image'); // Added more common phrasing
//     };

//     // Fetches the list of all conversations for the user
//     const fetchConversations = useCallback(async () => {
//         if (!userEmail || userEmail === 'anonymous') {
//             console.warn("Cannot fetch conversations: User email not found or is anonymous. Displaying anonymous chat only.");
//             setConversations([]);
//             return;
//         }

//         try {
//             // Using template literals for URL construction
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversations/${userEmail}`);
//             if (!response.ok) {
//                 // More specific error for network issues vs. server errors
//                 throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             // Using the 'title' and 'has_image_as_title' from backend
//             const formattedConversations = data.map(conv => ({
//                 id: conv._id,
//                 title: conv.title, // Now using the title provided by the backend
//                 created_at: conv.created_at,
//                 updated_at: conv.updated_at,
//                 has_image_as_title: conv.has_image_as_title // Prop from backend
//             }));
//             setConversations(formattedConversations);

//             // If no conversation is currently selected, select the most recent one
//             if (formattedConversations.length > 0 && !selectedConversationId) {
//                 setSelectedConversationId(formattedConversations[0].id);
//             }
//         } catch (error) {
//             console.error('Error fetching conversations:', error);
//             // Optionally set an error state for UI display
//         }
//     }, [userEmail, selectedConversationId]); // Depend on selectedConversationId to re-fetch if needed

//     // Fetches all messages for a specific conversation
//     const fetchMessagesForConversation = useCallback(async (convId) => {
//         setIsLoading(true);
//         setMessages([]); // Clear messages while loading new conversation
//         try {
//             const response = await fetch(`http://127.0.0.1:3000/chat/conversation/${convId}`);
//             if (!response.ok) {
//                 throw new Error(`Failed to fetch conversation history: ${response.status} ${response.statusText}`);
//             }
//             const data = await response.json();

//             // Backend already provides 'messages' array directly, including 'isImage' and 'image' (base64) properties
//             setMessages(data.messages);
//             setConversationId(data._id); // Update the current conversation ID
//             setSelectedConversationId(data._id); // Ensure selected ID is in sync
//         } catch (error) {
//             console.error('Error fetching messages for conversation:', error);
//             setMessages([{ role: 'assistant', content: 'Could not load chat history for this conversation. Please try a new chat.', isImage: false }]);
//             // Reset conversationId if loading failed
//             setConversationId(null);
//             setSelectedConversationId(null);
//         } finally {
//             setIsLoading(false);
//         }
//     }, []); // No specific dependencies that would cause infinite loop here, convId is passed as arg

//     // Effect to load conversations on component mount and when userEmail changes
//     useEffect(() => {
//         if (userEmail && userEmail !== 'anonymous') {
//             fetchConversations();
//         } else {
//             // For anonymous users, clear conversations and reset chat
//             setConversations([]);
//             // Avoid calling handleNewChat (which uses hooks) inside useEffect, just reset state directly
//             setSelectedConversationId(null);
//             setConversationId(null);
//             setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
//             setInputValue('');
//             stopListening();
//             setSidebarOpen(false);
//         }
//     }, [fetchConversations, userEmail]);

//     // Effect to load messages when a conversation is selected (or deselected for new chat)
//     useEffect(() => {
//         if (selectedConversationId) {
//             fetchMessagesForConversation(selectedConversationId);
//         } else {
//             // This path is for "New Chat" or when no conversation is selected
//             setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
//             setConversationId(null); // Explicitly clear conversationId
//         }
//     }, [selectedConversationId, fetchMessagesForConversation]);

//     // Handles starting a new chat session
//     const handleNewChat = () => {
//         setSelectedConversationId(null); // Deselects any active conversation
//         setConversationId(null); // Clears the current conversation ID
//         setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
//         setInputValue('');
//         stopListening(); // Stop any active listening session
//         setSidebarOpen(false); // Close sidebar on mobile
//         // Re-fetch conversations to ensure "New Chat" is not mistakenly seen as existing
//         fetchConversations();
//     };

//     // Handles selecting a conversation from the sidebar history
//     const handleConversationSelect = (convId) => {
//         if (convId === selectedConversationId) {
//             setSidebarOpen(false); // Just close sidebar if same conv is clicked
//             return;
//         }
//         setSelectedConversationId(convId);
//         setSidebarOpen(false); // Close sidebar on mobile
//     };

//     // Handles sending a message (text or voice)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const trimmedInputValue = inputValue.trim();

//         if (!trimmedInputValue) return; // Prevent sending empty messages

//         // Determine if it's an image request for frontend logic
//         const isImageReqClientFlag = isImageRequestClient(trimmedInputValue); // Use the renamed function

//         let messageToSendToBackend = trimmedInputValue;
//         // The backend already handles cleaning keywords for image generation,
//         // but if you want to visually reflect the clean prompt in the user's message,
//         // you could clean it here for the `userMessage` content, though backend handles actual image prompt.
//         // For simplicity, we'll send the raw user input to the backend and let it clean.
//         // The user's displayed message will be the raw input.

//         // Add user's message to the display immediately
//         const userMessage = {
//             role: 'user',
//             content: trimmedInputValue,
//             isImageRequest: isImageReqClientFlag // Store this flag for user messages too
//         };
//         setMessages(prev => [...prev, userMessage]);
//         setInputValue(''); // Clear input after sending
//         setIsLoading(true); // Show loading indicator
//         stopListening(); // Stop listening if voice input was active

//         try {
//             const response = await fetch('http://127.0.0.1:3000/chat', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     message: trimmedInputValue, // Send original message, backend cleans it
//                     user_email: userEmail,
//                     conversation_id: conversationId, // Will be null for new chats
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
//             }

//             const data = await response.json();

//             // Process AI response: directly use `data.isImage` from backend
//             const botMessage = {
//                 role: 'assistant',
//                 content: data.response,
//                 image: data.image, // Will be base64 string if an image
//                 isImage: data.isImage || false // Rely on backend's boolean, default to false
//             };
//             setMessages(prev => [...prev, botMessage]);

//             // If it's a new conversation or the ID changed, update states and refetch sidebar
//             if (data.conversation_id && data.conversation_id !== conversationId) {
//                 setConversationId(data.conversation_id);
//                 setSelectedConversationId(data.conversation_id); // Keep selected ID in sync
//                 fetchConversations(); // Update sidebar with new conversation
//             } else {
//                 // If it's an existing conversation, just update its 'updated_at' in the sidebar
//                 // by re-fetching conversations, which will resort them correctly.
//                 fetchConversations();
//             }
//         } catch (error) {
//             console.error('Fetch error during chat:', error);
//             setMessages(prev => [...prev, {
//                 role: 'assistant',
//                 content: 'Oops! My connection to the mystic realms is disturbed. Please try again.',
//                 isImage: false
//             }]);
//         } finally {
//             setIsLoading(false); // Hide loading indicator
//         }
//     };

//     // Handles user logout
//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('userEmail');
//         navigate('/login');
//     };

//     // Define trimmedInputValue for use in the render
//     const trimmedInputValue = inputValue.trim();

//     return (
//         <div className="flex h-screen text-white font-sans relative">
//             {/* Mobile menu button */}
//             <button
//                 className="sm:hidden absolute top-4 left-4 z-20 bg-indigo-700 p-2 rounded-full shadow-lg"
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 aria-label="Toggle sidebar menu"
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
//                         {userEmail !== 'anonymous' && (
//                             <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={userEmail}>Logged in as: {userEmail}</p>
//                         )}
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
//                         <p className="text-gray-400 text-sm">
//                             {userEmail !== 'anonymous' ? 'No past chats yet. Start a new conversation!' : 'No past chats. Messages for anonymous users are not saved.'}
//                         </p>
//                     ) : (
//                         <nav className="space-y-2">
//                             {conversations.map((conv) => (
//                                 <button
//                                     key={conv.id}
//                                     onClick={() => handleConversationSelect(conv.id)}
//                                     className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
//                                         ${selectedConversationId === conv.id ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/50 text-gray-200'}`}
//                                 >
//                                     <MessageSquare className="w-4 h-4 flex-shrink-0" />
//                                     <span className="text-sm truncate flex-grow">
//                                         {conv.title}
//                                     </span>
//                                     {conv.has_image_as_title && (
//                                        <ImageIcon className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" title="Started with an image" />
//                                     )}
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
//                     aria-hidden="true" // Indicate it's for visual effect, not interactive
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
//                         aria-label="Logout"
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
//                                 key={index} // Consider using msg._id for better unique key if available in messages array
//                                 className={`flex items-end gap-2 ${
//                                     msg.role === 'user' ? 'justify-end' : 'justify-start'
//                                 } animate-fade-in-up`}
//                             >
//                                 {msg.role === 'assistant' && (
//                                     <>
//                                         <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
//                                             <Bot className="w-4 h-4 text-purple-900" />
//                                         </div>
//                                         <div
//                                             className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
//                                                 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none`}
//                                         >
//                                             {/* Image display logic (already correct) */}
//                                             {msg.isImage && msg.image ? (
//                                                 <>
//                                                     {/* Display text content if present, above the image */}
//                                                     {msg.content && (
//                                                         <p className="whitespace-pre-wrap mb-2 text-gray-100 italic">
//                                                             {msg.content}
//                                                         </p>
//                                                     )}
//                                                     <img
//                                                         src={`data:image/png;base64,${msg.image}`} // Assuming PNG from Stability AI
//                                                         alt={msg.content || "Generated AI Image"} // Use content as alt text if available
//                                                         className="mt-2 rounded-lg max-w-full h-auto"
//                                                         style={{ maxWidth: '100%', height: 'auto' }} // Explicit styling for images
//                                                     />
//                                                 </>
//                                             ) : (
//                                                 // Regular text message
//                                                 <p className="whitespace-pre-wrap">{msg.content}</p>
//                                             )}
//                                         </div>
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
//                                         {msg.isImageRequest && ( // <--- Added visual indicator for user's image requests
//                                             <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" title="Image request" />
//                                         )}
//                                         <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
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
//                             type="button"
//                             onClick={isListening ? stopListening : startListening}
//                             className={`p-2 rounded-full transition-colors duration-200 ${
//                                 isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
//                             }`}
//                             disabled={isLoading || (recognitionRef.current === null)} // Disable if not supported
//                             title={isListening ? "Stop listening" : (recognitionRef.current ? "Start voice input" : "Voice input not supported")}
//                             aria-label={isListening ? "Stop voice input" : "Start voice input"}
//                         >
//                             <Mic className="w-4 h-4 text-white" />
//                         </button>

//                         <input
//                             id="chat-input" // Added ID for accessibility
//                             type="text"
//                             value={inputValue}
//                             onChange={(e) => setInputValue(e.target.value)}
//                             placeholder="Type or speak your message..."
//                             className="flex-1 bg-transparent text-sm text-white placeholder-gray-300 focus:outline-none"
//                             disabled={isLoading}
//                             aria-label="Type your message" // Added aria-label for accessibility
//                             onKeyDown={(e) => {
//                                 if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter for new line
//                                     handleSubmit(e);
//                                 }
//                             }}
//                         />
//                         <button
//                             type="submit"
//                             className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 rounded-full p-2 transition"
//                             disabled={isLoading || !trimmedInputValue} // Use trimmedInputValue
//                             aria-label="Send message"
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
import { Send, Bot, User, CornerDownLeft, LogOut, Menu, Mic, PlusCircle, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [userEmail] = useState(() => localStorage.getItem('userEmail') || 'anonymous');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);

    const chatRef = useRef(null);
    const recognitionRef = useRef(null);

    // **IMPORTANT: Update this to your Render backend URL**
    const BACKEND_URL = 'https://secretecho-hg3i.onrender.com';

    // --- Authentication Check ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No authentication token found. Redirecting to login.");
            navigate('/login');
        }
    }, [navigate]);

    if (!localStorage.getItem('token')) {
        return null;
    }

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
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                console.log('Voice recognition started.');
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
                console.log('Transcript:', transcript);
            };

            recognitionRef.current.onerror = (event) => {
                setIsListening(false);
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    alert('Microphone access denied. Please allow microphone access in your browser settings.');
                } else {
                    alert(`Speech recognition error: ${event.error}. Please try again.`);
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
            setInputValue('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
                alert("Could not start microphone. Please check your browser's microphone permissions or if another application is using it.");
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const isImageRequestClient = (message) => {
        const lowerCaseMessage = message.trim().toLowerCase();
        return lowerCaseMessage.includes('/image') ||
               lowerCaseMessage.includes('picture') ||
               lowerCaseMessage.includes('draw') ||
               lowerCaseMessage.includes('generate image');
    };

    // Fetches the list of all conversations for the user
    const fetchConversations = useCallback(async () => {
        if (!userEmail || userEmail === 'anonymous') {
            console.warn("Cannot fetch conversations: User email not found or is anonymous. Displaying anonymous chat only.");
            setConversations([]);
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/chat/conversations/${userEmail}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            const formattedConversations = data.map(conv => ({
                id: conv._id,
                title: conv.title,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                has_image_as_title: conv.has_image_as_title
            }));
            setConversations(formattedConversations);

            if (formattedConversations.length > 0 && !selectedConversationId) {
                setSelectedConversationId(formattedConversations[0].id);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    }, [userEmail, selectedConversationId, BACKEND_URL]); // Added BACKEND_URL to dependencies

    // Fetches all messages for a specific conversation
    const fetchMessagesForConversation = useCallback(async (convId) => {
        setIsLoading(true);
        setMessages([]);
        try {
            const response = await fetch(`${BACKEND_URL}/chat/conversation/${convId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch conversation history: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();

            setMessages(data.messages);
            setConversationId(data._id);
            setSelectedConversationId(data._id);
        } catch (error) {
            console.error('Error fetching messages for conversation:', error);
            setMessages([{ role: 'assistant', content: 'Could not load chat history for this conversation. Please try a new chat.', isImage: false }]);
            setConversationId(null);
            setSelectedConversationId(null);
        } finally {
            setIsLoading(false);
        }
    }, [BACKEND_URL]); // Added BACKEND_URL to dependencies

    // Effect to load conversations on component mount and when userEmail changes
    useEffect(() => {
        if (userEmail && userEmail !== 'anonymous') {
            fetchConversations();
        } else {
            setConversations([]);
            setSelectedConversationId(null);
            setConversationId(null);
            setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
            setInputValue('');
            stopListening();
            setSidebarOpen(false);
        }
    }, [fetchConversations, userEmail]);

    // Effect to load messages when a conversation is selected (or deselected for new chat)
    useEffect(() => {
        if (selectedConversationId) {
            fetchMessagesForConversation(selectedConversationId);
        } else {
            setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
            setConversationId(null);
        }
    }, [selectedConversationId, fetchMessagesForConversation]);

    // Handles starting a new chat session
    const handleNewChat = () => {
        setSelectedConversationId(null);
        setConversationId(null);
        setMessages([{ role: 'assistant', content: 'Hello! How can I help you today?', isImage: false }]);
        setInputValue('');
        stopListening();
        setSidebarOpen(false);
        fetchConversations();
    };

    // Handles selecting a conversation from the sidebar history
    const handleConversationSelect = (convId) => {
        if (convId === selectedConversationId) {
            setSidebarOpen(false);
            return;
        }
        setSelectedConversationId(convId);
        setSidebarOpen(false);
    };

    // Handles sending a message (text or voice)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedInputValue = inputValue.trim();

        if (!trimmedInputValue) return;

        const isImageReqClientFlag = isImageRequestClient(trimmedInputValue);

        const userMessage = {
            role: 'user',
            content: trimmedInputValue,
            isImageRequest: isImageReqClientFlag
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        stopListening();

        try {
            const response = await fetch(`${BACKEND_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedInputValue,
                    user_email: userEmail,
                    conversation_id: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            const botMessage = {
                role: 'assistant',
                content: data.response,
                image: data.image,
                isImage: data.isImage || false
            };
            setMessages(prev => [...prev, botMessage]);

            if (data.conversation_id && data.conversation_id !== conversationId) {
                setConversationId(data.conversation_id);
                setSelectedConversationId(data.conversation_id);
                fetchConversations();
            } else {
                fetchConversations();
            }
        } catch (error) {
            console.error('Fetch error during chat:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Oops! My connection to the mystic realms is disturbed. Please try again.',
                isImage: false
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handles user logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    const trimmedInputValue = inputValue.trim();

    return (
        <div className="flex h-screen text-white font-sans relative">
            {/* Mobile menu button */}
            <button
                className="sm:hidden absolute top-4 left-4 z-20 bg-indigo-700 p-2 rounded-full shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar menu"
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
                        {userEmail !== 'anonymous' && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={userEmail}>Logged in as: {userEmail}</p>
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
                        <p className="text-gray-400 text-sm">
                            {userEmail !== 'anonymous' ? 'No past chats yet. Start a new conversation!' : 'No past chats. Messages for anonymous users are not saved.'}
                        </p>
                    ) : (
                        <nav className="space-y-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleConversationSelect(conv.id)}
                                    className={`w-full text-left flex items-center gap-2 p-2 rounded-lg transition-colors duration-200
                                        ${selectedConversationId === conv.id ? 'bg-indigo-700 text-white' : 'hover:bg-indigo-700/50 text-gray-200'}`}
                                >
                                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm truncate flex-grow">
                                        {conv.title}
                                    </span>
                                    {conv.has_image_as_title && (
                                       <ImageIcon className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" title="Started with an image" />
                                    )}
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
                    aria-hidden="true"
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
                        aria-label="Logout"
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
                                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-purple-900" />
                                        </div>
                                        <div
                                            className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-sm shadow-lg
                                                bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-bl-none`}
                                        >
                                            {msg.isImage && msg.image ? (
                                                <>
                                                    {msg.content && (
                                                        <p className="whitespace-pre-wrap mb-2 text-gray-100 italic">
                                                            {msg.content}
                                                        </p>
                                                    )}
                                                    <img
                                                        src={`data:image/png;base64,${msg.image}`}
                                                        alt={msg.content || "Generated AI Image"}
                                                        className="mt-2 rounded-lg max-w-full h-auto"
                                                        style={{ maxWidth: '100%', height: 'auto' }}
                                                    />
                                                </>
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
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
                                        {msg.isImageRequest && (
                                            <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" title="Image request" />
                                        )}
                                        <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 text-green-900" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}

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
                            type="button"
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-full transition-colors duration-200 ${
                                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            disabled={isLoading || (recognitionRef.current === null)}
                            title={isListening ? "Stop listening" : (recognitionRef.current ? "Start voice input" : "Voice input not supported")}
                            aria-label={isListening ? "Stop voice input" : "Start voice input"}
                        >
                            <Mic className="w-4 h-4 text-white" />
                        </button>

                        <input
                            id="chat-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type or speak your message..."
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-300 focus:outline-none"
                            disabled={isLoading}
                            aria-label="Type your message"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 rounded-full p-2 transition"
                            disabled={isLoading || !trimmedInputValue}
                            aria-label="Send message"
                        >
                            <Send className="w-4 h-4 text-purple-900" />
                        </button>
                    </form>
                    <div className="text-center text-xs text-gray-200 pt-2 flex justify-center items-center">
                        Press <CornerDownLeft className="w-3 h-3 mx-1" /> to send (or use the microphone!)
                    </div>
                </footer>
            </div>

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