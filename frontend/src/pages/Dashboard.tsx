import { useState, useEffect } from 'react';
import UserDashboard from './dashboards/UserDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import TechnicianDashboard from './dashboards/TechnicianDashboard';

export default function Dashboard() {
    const [role, setRole] = useState('USER');

    useEffect(() => {
        setRole(localStorage.getItem('userRole') || 'USER');
    }, []);

    if (role === 'USER') {
        return <UserDashboard />;
    }

    if (role === 'ADMIN') {
        return <AdminDashboard />;
    }

    if (role === 'TECHNICIAN') {
        return <TechnicianDashboard />;
    }

    return <div>Loading...</div>;
}
