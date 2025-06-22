
export default function ChatWindow({ messages }) {
  return (
    <div className="p-4 h-[80vh] overflow-y-auto space-y-3">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`w-fit max-w-[70%] p-3 rounded-2xl text-white ${
            msg.sender === "user" ? "bg-blue-500 ml-auto" : "bg-gray-700"
          } animate-fade-in-up`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
