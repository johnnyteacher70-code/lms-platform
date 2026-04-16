import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar() {
  const { user } = useAuth();

  // Define links based on user roles
  let links = [];

  if (user?.role === 'admin') {
    links = [
      { name: 'Dashboard', path: '/admin-dashboard' },
      { name: 'Manage Users', path: '/admin-dashboard/users' },
      { name: 'Platform Settings', path: '/admin-dashboard/settings' },
    ];
  } else if (user?.role === 'teacher') {
    links = [
      { name: 'Vazifalar paneli', path: '/teacher-dashboard' },
      { name: 'Mening Guruhlarim', path: '/teacher-dashboard/groups' },
      { name: 'Modullar va Darslar', path: '/teacher-dashboard/modules' },
      { name: 'Xabarlar', path: '/teacher-dashboard/chat' }
    ];
  } else if (user?.role === 'student') {
    links = [
      { name: 'Mening Vazifalarim', path: '/student-dashboard' },
      { name: 'Darsliklar va Materiallar', path: '/student-dashboard/modules' },
      { name: 'Mening O\'qituvchim', path: '/student-dashboard/chat' }
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-[calc(100vh-4rem)] sticky top-16 hidden lg:block overflow-y-auto shadow-sm">
      <div className="p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Menu</p>
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path.split('/').length === 2} // Exact match for basic paths
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-primary shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <li></li>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Decorative Bottom Graphic */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50">
        <p className="text-sm font-semibold text-indigo-900 mb-1">Need help?</p>
        <p className="text-xs text-indigo-700/70 mb-3">Check our docs.</p>
        <button className="w-full bg-white text-primary text-xs font-bold py-2 rounded-lg shadow-sm hover:shadow transition-shadow border border-indigo-50">
          Documentation
        </button>
      </div>
    </aside>
  );
}
