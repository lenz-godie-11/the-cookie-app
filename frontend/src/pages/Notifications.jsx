import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  Bell,
  Trash2,
  CheckCheck,
  Package,
  Users,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com") +
  "/api";
const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://the-cookie-app.onrender.com";

const socket = io(SOCKET_URL);

const getIcon = (type) => {
  switch (type) {
    case "consume":
      return <Package size={16} className="text-blue-500" />;
    case "stock":
      return <AlertTriangle size={16} className="text-yellow-500" />;
    case "member":
      return <Users size={16} className="text-green-500" />;
    case "message":
      return <MessageSquare size={16} className="text-purple-500" />;
    default:
      return <Bell size={16} className="text-slate-400" />;
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case "consume":
      return "Inventory";
    case "stock":
      return "Stock Alert";
    case "member":
      return "New Member";
    case "message":
      return "Message";
    default:
      return "Notification";
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString();
};

const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export default function Notifications({ theme = "dark" }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDark = theme === "dark";
  const username = localStorage.getItem("username");
  const family_id = localStorage.getItem("family_id");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/notifications/${username}?family_id=${family_id}`,
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    socket.emit("join_user_room", username);
    socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });
    return () => socket.off("new_notification");
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-all-read`, {
        username,
        family_id,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read/${id}`, {
        username,
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
        data: { username },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const todayNotifs = notifications.filter((n) => isToday(n.created_at));
  const earlierNotifs = notifications.filter((n) => !isToday(n.created_at));

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[80vh] ${isDark ? "bg-[#0a0a0b]" : "bg-slate-50"}`}
      >
        <p className={isDark ? "text-slate-400" : "text-slate-500"}>
          Loading notifications...
        </p>
      </div>
    );
  }

  const renderNotifCard = (notif) => {
    let cardStyle = "";
    if (notif.is_read) {
      cardStyle = isDark
        ? "bg-[#121214] border-white/5 opacity-60"
        : "bg-slate-100 border-slate-200/60 opacity-70";
    } else {
      cardStyle = isDark
        ? "bg-[#1a1a1c] border-[#3b5d8f]/30 hover:border-[#3b5d8f]/60"
        : "bg-white border-[#3b5d8f]/20 shadow-sm hover:border-[#3b5d8f]/50";
    }

    return (
      <div
        key={notif.id}
        onClick={() => !notif.is_read && handleMarkRead(notif.id)}
        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${cardStyle}`}
      >
        <div className="mt-0.5">{getIcon(notif.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              {getTypeLabel(notif.type)}
            </span>
            {!notif.is_read && (
              <span className="w-2 h-2 rounded-full bg-[#3b5d8f]" />
            )}
          </div>
          <p
            className={`text-sm ${isDark ? "text-slate-300" : "text-slate-800"}`}
          >
            {notif.message}
          </p>
          <p
            className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}
          >
            {formatTime(notif.created_at)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(notif.id);
          }}
          className={`transition-all mt-0.5 ${isDark ? "text-slate-600 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-[#3b5d8f]" />
          <h1
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-[#3b5d8f] text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-all ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-[#1a1a1c]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell
            size={48}
            className={`${isDark ? "text-slate-700" : "text-slate-300"} mb-4`}
          />
          <p
            className={`font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            No notifications yet
          </p>
          <p
            className={
              isDark ? "text-slate-600" : "text-slate-400 text-sm mt-1"
            }
          >
            Activity from your family will appear here
          </p>
        </div>
      )}

      {todayNotifs.length > 0 && (
        <div className="mb-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
            Today
          </p>
          <div className="space-y-2">{todayNotifs.map(renderNotifCard)}</div>
        </div>
      )}

      {earlierNotifs.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
            Earlier
          </p>
          <div className="space-y-2">{earlierNotifs.map(renderNotifCard)}</div>
        </div>
      )}
    </div>
  );
}
