
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Lock, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('family_id');
    localStorage.removeItem('is_admin');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-[#121214] border-b border-white/5 px-4 py-3 flex items-center justify-between relative">
      <span className="text-[#3b5d8f] font-bold text-lg tracking-wide">kuki store</span>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link to="/chat" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <MessageSquare size={16} /> Group Chat
        </Link>
        <Link to="/private-chat" className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all">
          <Lock size={16} /> Chat
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all ml-2">
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Mobile hamburger button */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-400 hover:text-white p-2">
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#121214] border-b border-white/5 flex flex-col px-4 py-3 gap-1 z-50 md:hidden">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium">
            <MessageSquare size={16} /> Group Chat
          </Link>
          <Link to="/private-chat" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium">
            <Lock size={16} /> Chat
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
} 