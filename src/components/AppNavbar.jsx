import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Bell, LogOut, Menu } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';

export default function AppNavbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleNew = (e) => setNotifications(prev => [e.detail, ...prev]);
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    window.addEventListener('notificationReceived', handleNew);
    document.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('notificationReceived', handleNew);
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications(user._id);
      setNotifications(data);
    } catch {}
  };

  const handleMarkRead = async (id, link) => {
    try {
      if (id) await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setShowDropdown(false);
      if (link) navigate(link);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user._id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleColors = {
    admin: 'bg-rose-50 text-rose-600',
    teacher: 'bg-violet-50 text-violet-600',
    student: 'bg-emerald-50 text-emerald-600',
  };
  const roleLabel = { admin: 'Admin', teacher: "O'qituvchi", student: 'Talaba' };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm z-50">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu - Only Mobile/Tablet */}
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-500 hover:bg-slate-50 rounded-xl lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
          <span className="text-white font-black text-sm">J</span>
        </div>
        <span className="font-black text-slate-800 tracking-tight text-base">Junior IT</span>
      </Link>
      </div>

      {/* Right: User Actions */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`relative p-2 rounded-xl transition-all ${showDropdown ? 'bg-violet-50 text-violet-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              )}
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Bildirishnomalar</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] font-black text-violet-600 hover:underline">Barchasi o'qildi</button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Hozircha xabarlar yo'q</p>
                      </div>
                    ) : notifications.map(n => (
                      <div
                        key={n._id}
                        onClick={() => handleMarkRead(n._id, n.link)}
                        className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-violet-50/40' : ''}`}
                      >
                        {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 mr-2 mb-0.5"></span>}
                        <p className={`text-xs leading-relaxed ${!n.isRead ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-6 bg-slate-100"></div>

          {/* User */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 font-black text-sm border border-violet-100">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-black text-slate-700 leading-none">{user.name}</span>
              <span className={`text-[10px] font-black mt-0.5 px-1.5 py-0.5 rounded-md w-fit ${roleColors[user.role] || 'bg-slate-100 text-slate-500'}`}>
                {roleLabel[user.role] || user.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
