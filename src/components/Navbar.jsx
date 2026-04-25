import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Bell, LogOut, User as UserIcon, ChevronDown, Menu as MenuIcon, X } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handleNewNotif = (e) => {
      setNotifications(prev => [e.detail, ...prev]);
    };
    window.addEventListener('notificationReceived', handleNewNotif);
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('notificationReceived', handleNewNotif);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications(user._id);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      if(id) await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setShowDropdown(false);
      if (link) navigate(link);
    } catch (err) { }
  };
  
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user._id);
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (err) {}
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 shadow-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20"
            >
              J
            </motion.div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              Junior IT
            </span>
          </Link>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary font-semibold transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`relative p-2.5 rounded-xl transition-all duration-300 ${showDropdown ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                  >
                    <Bell size={20} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-500/20"></span>
                    )}
                  </motion.button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden origin-top-right ring-1 ring-slate-200/50"
                      >
                        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                          <h3 className="font-bold text-slate-800 text-sm">Bildirishnomalar</h3>
                          {unreadCount > 0 && (
                             <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline font-bold">
                               Barchasi o'qilgan
                             </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="py-12 px-6 text-center text-slate-400">
                              <Bell className="mx-auto mb-3 opacity-20" size={32} />
                              <p className="text-sm">Hozircha hech qanday xabar yo'q</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <motion.div 
                                key={notif._id} 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => handleMarkAsRead(notif._id, notif.link)}
                                className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 flex flex-col ${!notif.isRead ? 'bg-primary/5' : ''}`}
                              >
                                <p className={`text-sm leading-relaxed ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                  {notif.message}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
                                  {new Date(notif.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString('uz-UZ')}
                                </span>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-px h-8 bg-slate-200/60 mx-1"></div>

                <div className="flex items-center gap-3 pl-1">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 leading-none">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                      {user.role}
                    </span>
                  </div>
                  
                  {/* User Avatar Initial */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-primary font-black border-2 border-white shadow-sm ring-4 ring-slate-100/50"
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>

                  <button 
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl group"
                    title="Chiqish"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-primary font-black text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center font-bold text-slate-700 hover:bg-slate-50 rounded-xl">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full py-3 text-center font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-sm font-black text-slate-900">{user.name}</div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{user.role}</div>
                  </div>
                  <Link to={`/${user.role}-dashboard`} onClick={() => setMobileMenuOpen(false)} className="w-full py-3 px-4 flex items-center gap-3 font-bold text-slate-700 hover:bg-slate-50 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full py-3 px-4 flex items-center gap-3 font-bold text-rose-500 hover:bg-rose-50 rounded-xl text-left"
                  >
                    <LogOut size={18} />
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
