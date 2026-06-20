import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Send, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com") +
  "/api";
const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com";

const socket = io(SOCKET_URL);

export default function PrivateChat({ username, familyId, theme = "dark" }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [recipient, setRecipient] = useState("");
  const [chatStarted, setChatStarted] = useState(false);
  const [members, setMembers] = useState([]);
  const bottomRef = useRef(null);

  const isDark = theme === "dark";
  const room = [username, recipient].sort().join("_");

  useEffect(() => {
    if (!familyId) return;
    axios
      .get(
        `${API_BASE_URL}/auth/family-members/${familyId}?username=${username}`,
      )
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Failed to fetch members:", err));
  }, [familyId]);

  useEffect(() => {
    if (!chatStarted) return;
    socket.emit("join_room", room);
    axios
      .get(
        `${API_BASE_URL}/messages/private/${username}/${recipient}?requester=${username}`,
      )
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Failed to fetch messages:", err));

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, [chatStarted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const data = { username, message: input, room };
    socket.emit("send_message", data);
    await axios.post(`${API_BASE_URL}/messages/save`, data);
    setInput("");
  };

  if (!chatStarted) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[80vh] p-4 transition-colors duration-200 ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
      >
        <div
          className={`border rounded-2xl p-8 w-full max-w-md transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200 shadow-xl"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-[#1a1a1c]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Home size={16} /> Home
            </button>
            <h2 className="text-2xl font-bold text-[#3b5d8f]">TextMe</h2>
          </div>
          <p
            className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Family members:
          </p>
          <div className="space-y-2">
            {members
              .filter((u) => u.username !== username)
              .map((u, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setRecipient(u.username);
                    setChatStarted(true);
                  }}
                  className={`w-full border px-4 py-3 rounded-xl text-left transition-colors ${
                    isDark
                      ? "bg-[#1a1a1c] border-white/10 text-slate-300 hover:bg-[#252528]"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {u.username}
                </button>
              ))}
            {members.filter((u) => u.username !== username).length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">
                No family members yet — share your invite link!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full max-w-2xl mx-auto p-4 transition-colors duration-200`}
    >
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setChatStarted(false)}
          className={`${isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-[#3b5d8f]">
          TextMe {recipient}
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            isDark
              ? "text-slate-400 hover:text-white hover:bg-[#1a1a1c]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Home size={16} /> Home
        </button>
      </div>

      <div
        className={`flex-1 min-h-0 overflow-y-auto rounded-2xl p-4 space-y-3 border transition-all ${isDark ? "bg-[#121214] border-white/5" : "bg-white border-slate-200 shadow-inner"}`}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.username === username ? "items-end" : "items-start"}`}
          >
            <span
              className={`text-xs mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {msg.username}
            </span>
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${
                msg.username === username
                  ? "bg-[#3b5d8f] text-white"
                  : isDark
                    ? "bg-[#1a1a1c] text-slate-300"
                    : "bg-slate-100 text-slate-800"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className={`flex-1 border rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-[#3b5d8f] transition-colors ${
            isDark
              ? "bg-[#1a1a1c] border-white/10 text-white"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        />
        <button
          onClick={sendMessage}
          className="bg-[#3b5d8f] hover:bg-[#2d4a73] text-white px-4 py-3 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
