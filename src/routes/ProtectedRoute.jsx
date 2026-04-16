import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // If there is no user logged in, send them back to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the child routes
  return <Outlet />;
}
