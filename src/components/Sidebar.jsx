import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ClipboardList, 
  Layers, 
  BookOpen, 
  MessageSquare, 
  Trophy,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  // Define links based on user roles
  let links = [];

  if (user?.role === 'admin') {
    links = [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    ];
  } else if (user?.role === 'teacher') {
    links = [
      { name: 'Vazifalar paneli', path: '/teacher-dashboard', icon: LayoutDashboard },
      { name: 'Mening Guruhlarim', path: '/teacher-dashboard/groups', icon: Users },
      { name: 'Modullar va Darslar', path: '/teacher-dashboard/modules', icon: Layers },
      { name: 'Xabarlar', path: '/teacher-dashboard/chat', icon: MessageSquare }
    ];
  } else if (user?.role === 'student') {
    links = [
      { name: 'Mening Vazifalarim', path: '/student-dashboard', icon: ClipboardList },
      { name: 'Darsliklar va Materiallar', path: '/student-dashboard/modules', icon: BookOpen },
      { name: 'Mening O\'qituvchim', path: '/student-dashboard/chat', icon: MessageSquare },
      { name: 'Mening Guruhim', path: '/student-dashboard/group', icon: Trophy }
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex flex-col overflow-y-auto shadow-sm z-40">
      <div className="p-6 flex-grow">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">Main Menu</p>
        <nav className="space-y-1">
          {links.map((link, idx) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <NavLink
                to={link.path}
                end={link.path.split('/').length === 2}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm group ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <link.icon className="w-5 h-5" strokeWidth={2.5} />
                {link.name}
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Decorative Bottom Graphic */}
      <div className="p-6 pt-0">
        <div className="relative p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors"></div>
          <div className="relative z-10 text-white">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
              <HelpCircle size={18} className="text-primary-light" />
            </div>
            <p className="text-sm font-bold mb-1">Need help?</p>
            <p className="text-[10px] text-slate-400 mb-4 font-medium leading-relaxed">Check our professional resources.</p>
            <button className="w-full bg-primary hover:bg-primary-hover text-white text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg shadow-lg shadow-black/20 transition-all active:scale-95">
              Documentation
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
