import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import { useAuth } from './hooks/useAuth'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import CourseDetail from './pages/CourseDetail'
import LessonPage from './pages/LessonPage'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import TeacherModules from './pages/TeacherModules'
import StudentModules from './pages/StudentModules'
import TeacherChat from './pages/TeacherChat'
import StudentChat from './pages/StudentChat'
import StudentGroupStats from './pages/StudentGroupStats'

// Layouts & Guards
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleBasedRoute from './routes/RoleBasedRoute'

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://lms-platform-efpp.onrender.com');
      
      socket.emit('join', user._id);
      
      socket.on('new_notification', (data) => {
        toast(data.message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        window.dispatchEvent(new CustomEvent('notificationReceived', { detail: data }));
      });
      
      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      
        {/* 🔴 PUBLIC ROUTES */}
      <Route element={<MainLayout />}>
        <Route 
          path="/" 
          element={user ? <Navigate to={`/${user.role}-dashboard`} replace /> : <Login />} 
        />
        <Route path="/login" element={user ? <Navigate to={`/${user.role}-dashboard`} replace /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/course/:id" element={<CourseDetail />} />
      </Route>
      
      {/* 🔴 PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        
        {/* Immersive Full-Screen Routes (No Sidebar) */}
        <Route path="/lesson/:courseId" element={<LessonPage />} />

        {/* Teacher Dashboard - Full Screen, own layout */}
        <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher-dashboard/groups" element={<TeacherDashboard />} />
        </Route>

        {/* Dashboard Routes (With Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher-dashboard/modules" element={<TeacherModules />} />
            <Route path="/teacher-dashboard/chat" element={<TeacherChat />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard/modules" element={<StudentModules />} />
            <Route path="/student-dashboard/chat" element={<StudentChat />} />
            <Route path="/student-dashboard/group" element={<StudentGroupStats />} />
          </Route>
        </Route>

      </Route>
      
    </Routes>
    </>
  )
}
