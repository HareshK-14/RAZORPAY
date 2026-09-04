import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/dashboard"
        state={{
          restricted: true,
          attemptedPath: location.pathname,
          userRole: user.role,
          requiredRoles: allowedRoles
        }}
        replace
      />
    );
  }

  return children;
}
