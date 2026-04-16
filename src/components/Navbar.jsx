import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Bell } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
    <nav className="glass sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              U
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              MiniUdemy
            </span>
          </Link>

          {/* Desktop Right Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full font-medium shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 text-slate-500 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-full"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                    )}
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-semibold text-slate-800 text-sm">Bildirishnomalar</h3>
                        {unreadCount > 0 && (
                           <button onClick={handleMarkAllRead} className="text-xs text-primary hover:text-indigo-700 font-medium tracking-wide">
                             Barchasini o'qish
                           </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto w-full">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">Hozircha Hech qanday xabar yo'q</div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleMarkAsRead(notif._id, notif.link)}
                              className={`p-3 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 flex flex-col ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                            >
                              <p className={`text-sm break-words ${!notif.isRead ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleString('uz-UZ')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                
                {/* User Avatar Initial */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm ring-2 ring-indigo-50">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                
                <button 
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-500 font-medium transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
