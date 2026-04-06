import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userId = params.get('userId');
        const role = params.get('role');
        const email = params.get('email');
        const name = params.get('name');

        if (userId && role) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('userRole', role);
            if (email) localStorage.setItem('userEmail', email);
            if (name) localStorage.setItem('userName', name);

            navigate('/dashboard', { replace: true });
        } else {
            console.error('Authentication failed: Missing parameters', Object.fromEntries(params.entries()));
            navigate('/login?error=AuthenticationFailed', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Completing sign in securely...</p>
            </div>
        </div>
    );
}
