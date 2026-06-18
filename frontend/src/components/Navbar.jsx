import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Lock,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://onrender.com") + "/api";
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://onrender.com";

const socket = io(SOCKET_URL);

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const username = localStorage.getItem("username");
  const family_id = localStorage.getItem("family_id");

  useEffect(() => {
    if (!username || !family_id) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/notifications/${username}?family_id=${family_id}`,
        );
        const unread = res.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchUnread();
    socket.emit("join_user_room", username);

    const handleNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("new_notification", handleNotification);
    };
  }, [username, family_id]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("family_id");
    localStorage.removeItem("is_admin");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-[#121214] border-b border-white/5 px-4 py-3 flex items-center justify-between relative">
      <span className="text-[#3b5d8f] font-bold text-lg tracking-wide">
        kuki store
      </span>

      <div className="hidden lg:flex items-center gap-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all"
        >
          <LayoutDashboard size={16} /> Dashboard
        </Link>
        <Link
          to="/chat"
          className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all"
        >
          <MessageSquare size={16} /> Group Chat
        </Link>
        <Link
          to="/private-chat"
          className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all"
        >
          <Lock size={16} /> Chat
        </Link>
        <Link
          to="/notifications"
          className="relative flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#3b5d8f] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all"
        >
          <Settings size={16} />
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium transition-all ml-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden text-slate-400 hover:text-white p-2"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#121214] border-b border-white/5 flex flex-col px-4 py-3 gap-1 z-50 lg:hidden">
          <Link
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            to="/chat"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <MessageSquare size={16} /> Group Chat
          </Link>
          <Link
            to="/private-chat"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <Lock size={16} /> Chat
          </Link>
          <Link
            to="/notifications"
            onClick={() => setMenuOpen(false)}
            className="relative flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <Bell size={16} /> Notifications
            {unreadCount > 0 && (
              <span className="bg-[#3b5d8f] text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/settings"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <Settings size={16} /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 px-3 py-2 rounded-xl hover:bg-[#1a1a1c] text-sm font-medium"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
