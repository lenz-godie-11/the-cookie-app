import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Send } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com';

const socket = io(SOCKET_URL);

export default function PrivateChat({ username }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recipient, setRecipient] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [users, setUsers] = useState([]);
  const bottomRef = useRef(null);

  const room = [username, recipient].sort().join('_');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/auth/users`).then(res => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (!chatStarted) return;
    socket.emit('join_room', room);
    axios.get(`${API_BASE_URL}/messages/private/${username}/${recipient}`).then(res => setMessages(res.data));

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    return () => socket.off('receive_message');
  }, [chatStarted]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const data = { username, message: input, room };
    socket.emit('send_message', data);
    await axios.post(`${API_BASE_URL}/messages/save`, data);
    setInput('');
  };

  if (!chatStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-[#3b5d8f] mb-6">Private Chat</h2>
          <p className="text-slate-400 text-sm mb-4">Choose who to chat with:</p>
          <div className="space-y-2">
            {users.filter(u => u.username !== username).map((u, i) => (
              <button
                key={i}
                onClick={() => { setRecipient(u.username); setChatStarted(true); }}
                className="w-full bg-[#1a1a1c] border border-white/10 text-slate-300 px-4 py-3 rounded-xl text-left hover:bg-[#252528]"
              >
                {u.username}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-[#3b5d8f] mb-4">Chat na {recipient}</h2>
      <div className="flex-1 overflow-y-auto bg-[#121214] rounded-2xl p-4 space-y-3 border border-white/5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-slate-500 mb-1">{msg.username}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${msg.username === username ? 'bg-[#3b5d8f] text-white' : 'bg-[#1a1a1c] text-slate-300'}`}>
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
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-[#3b5d8f]"
        />
        <button onClick={sendMessage} className="bg-[#3b5d8f] text-white px-4 py-3 rounded-xl">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}