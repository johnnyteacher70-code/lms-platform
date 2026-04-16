import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleBasedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is NOT in the allowedRoles array, redirect to the home page or a 403 page
  if (!allowedRoles.includes(user.role)) {
    // Alternatively, we could redirect them to their own dashboard based on their role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
