import { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!name || !email || !password) {
            setError('All fields are required.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    name,
                    role,
                    password
                })
            });

            if (!response.ok) {
                throw new Error('Failed to register account.');
            }

            setSuccess('Role assigned successfully! Redirecting to Google Login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-500/30">
                        SC
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                        Join Smart Campus
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-300">
                        Create an account to access resources
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-xl py-8 px-8 shadow-2xl rounded-3xl sm:px-10 border border-slate-200/50">

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 flex items-center text-red-700 text-sm border border-red-200">
                            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-green-50 flex items-center text-green-700 text-sm border border-green-200">
                            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">{success}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                placeholder="Jane Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">University Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                placeholder="jane@university.edu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role Selection</label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-700 hover:border-slate-300"
                            >
                                <option value="USER">Student / Staff</option>
                                <option value="TECHNICIAN">Technician</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,39%)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 items-center disabled:opacity-75"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5 mr-3" />
                                    Register Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm font-medium text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
