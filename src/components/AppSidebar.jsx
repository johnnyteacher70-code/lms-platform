import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, Settings, ClipboardList,
  Layers, BookOpen, MessageSquare, Trophy, HelpCircle, X
} from 'lucide-react';

export default function AppSidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  let links = [];

  if (user?.role === 'admin') {
    links = [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
    ];
  } else if (user?.role === 'teacher') {
    links = [
      { name: 'Vazifalar paneli', path: '/teacher-dashboard', icon: LayoutDashboard },
      { name: 'Guruhlarim', path: '/teacher-dashboard/groups', icon: Users },
      { name: 'Modullar', path: '/teacher-dashboard/modules', icon: Layers },
      { name: 'Xabarlar', path: '/teacher-dashboard/chat', icon: MessageSquare },
    ];
  } else if (user?.role === 'student') {
    links = [
      { name: 'Dashboard', path: '/student-dashboard', icon: LayoutDashboard },
      { name: 'Darsliklar', path: '/student-dashboard/modules', icon: BookOpen },
      { name: "O'qituvchim", path: '/student-dashboard/chat', icon: MessageSquare },
      { name: 'Guruhim', path: '/student-dashboard/group', icon: Trophy },
    ];
  }

  const SidebarContent = (
    <div className="w-64 bg-white h-full flex flex-col shadow-sm border-r border-slate-100">
      {/* Mobile Header (Only visible in drawer) */}
      <div className="p-4 lg:hidden flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <span className="text-white font-black text-sm">J</span>
          </div>
          <span className="font-black text-slate-800 text-sm tracking-tight">Junior IT</span>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 flex-grow overflow-y-auto">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-2">Menyu</p>
        <nav className="space-y-1">
          {links.map((link, idx) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <NavLink
                to={link.path}
                onClick={onClose}
                end={link.path.split('/').length === 2}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group font-bold ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`}
                      strokeWidth={2.5}
                    />
                    {link.name}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </div>

      <div className="p-4 pt-0">
        <div className="relative bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center mb-3">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-black mb-0.5">Yordam kerakmi?</p>
            <p className="text-[10px] text-violet-200 leading-relaxed">Qo'llanmani ko'rib chiqing.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex shrink-0 w-64 h-full">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0"
            >
              {SidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
