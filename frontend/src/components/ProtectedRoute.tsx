import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const role = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!role || !userId) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        // Logged in but doesn't have required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
