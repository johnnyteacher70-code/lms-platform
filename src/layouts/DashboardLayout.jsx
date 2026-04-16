import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-grow flex">
        <Sidebar />
        <main className="flex-grow p-6 lg:p-10 bg-slate-50 w-full overflow-hidden">
          <div className="max-w-6xl mx-auto h-full">
            {/* The individual page (Student, Teacher, Admin Dash) is injected here */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
