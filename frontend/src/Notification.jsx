import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Bell, Trash2, CheckCheck, Package, Users, MessageSquare, AlertTriangle } from 'lucide-react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com') + '/api';
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://the-cookie-app.onrender.com';

const socket = io(SOCKET_URL);

const getIcon = (type) => {
  switch (type) {
    case 'consume': return <Package size={16} className="text-blue-400" />;
    case 'stock': return <AlertTriangle size={16} className="text-yellow-400" />;
    case 'member': return <Users size={16} className="text-green-400" />;
    case 'message': return <MessageSquare size={16} className="text-purple-400" />;
    default: return <Bell size={16} className="text-slate-400" />;
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'consume': return 'Inventory';
    case 'stock': return 'Stock Alert';
    case 'member': return 'New Member';
    case 'message': return 'Message';
    default: return 'Notification';
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem('username');
  const family_id = localStorage.getItem('family_id');

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/${username}?family_id=${family_id}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.emit('join_user_room', username);

    socket.on('new_notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => socket.off('new_notification');
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-all-read`, {
        username,
        family_id
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/notifications/mark-read/${id}`, { username });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${id}`, { data: { username } });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const todayNotifs = notifications.filter(n => isToday(n.created_at));
  const earlierNotifs = notifications.filter(n => !isToday(n.created_at));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-[#0a0a0b]">
        <p className="text-slate-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-[#3b5d8f]" />
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-[#3b5d8f] text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-xl hover:bg-[#1a1a1c] transition-all"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell size={48} className="text-slate-700 mb-4" />
          <p className="text-slate-400 font-medium">No notifications yet</p>
          <p className="text-slate-600 text-sm mt-1">Activity from your family will appear here</p>
        </div>
      )}

      {todayNotifs.length > 0 && (
        <div className="mb-6">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Today</p>
          <div className="space-y-2">
            {todayNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  notif.is_read
                    ? 'bg-[#121214] border-white/5 opacity-60'
                    : 'bg-[#1a1a1c] border-[#3b5d8f]/30 hover:border-[#3b5d8f]/60'
                }`}
              >
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {getTypeLabel(notif.type)}
                    </span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#3b5d8f]" />
                    )}
                  </div>
                  <p className="text-slate-300 text-sm">{notif.message}</p>
                  <p className="text-slate-600 text-xs mt-1">{formatTime(notif.created_at)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                  className="text-slate-600 hover:text-red-400 transition-all mt-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {earlierNotifs.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Earlier</p>
          <div className="space-y-2">
            {earlierNotifs.map(notif => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  notif.is_read
                    ? 'bg-[#121214] border-white/5 opacity-60'
                    : 'bg-[#1a1a1c] border-[#3b5d8f]/30 hover:border-[#3b5d8f]/60'
                }`}
              >
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {getTypeLabel(notif.type)}
                    </span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#3b5d8f]" />
                    )}
                  </div>
                  <p className="text-slate-300 text-sm">{notif.message}</p>
                  <p className="text-slate-600 text-xs mt-1">{formatTime(notif.created_at)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                  className="text-slate-600 hover:text-red-400 transition-all mt-0.5"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}