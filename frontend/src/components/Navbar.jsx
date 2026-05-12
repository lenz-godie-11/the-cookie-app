import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Lock, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-[#121214] border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <span className="text-[#3b5d8f] font-bold text-lg tracking-wide"> Cookie App</span>
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link to="/chat" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <MessageSquare size={16} /> Group Chat
        </Link>
        <Link to="/private-chat" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <Lock size={16} /> Private Chat
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all ml-2">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}