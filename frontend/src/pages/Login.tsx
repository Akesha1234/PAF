import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState<'USER' | 'STAFF'>('USER');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLightOn, setIsLightOn] = useState(false);
    const [isPulling, setIsPulling] = useState(false);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleStaffLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) throw new Error('Invalid email or password');

            const data = await res.json();
            localStorage.setItem('userId', data.id);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userEmail', data.email);
            localStorage.setItem('userName', data.name);

            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Light Pull Overlay */}
            <div className={`fixed inset-0 z-50 flex justify-center transition-all duration-[1200ms] ease-in-out ${isLightOn ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto bg-[#0a0a0c]'}`}>
              <div className="relative flex flex-col items-center group h-full select-none pt-0">
                  {/* Ceiling mount */}
                  <div className="absolute w-20 h-4 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-900 rounded-b-full shadow-[0_5px_15px_rgba(0,0,0,0.9)] z-20 top-0 border-b border-zinc-500/30"></div>

                  {/* The Main Wire */}
                  <div className="w-[4px] bg-gradient-to-r from-stone-900 via-stone-700 to-stone-950 shadow-[inset_1px_0_2px_rgba(0,0,0,0.8)]" style={{ height: '22vh' }}></div>
                  
                  {/* Vintage Socket Base */}
                  <div className="w-10 h-5 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-800 rounded-t-lg shadow-lg z-10 transition-colors"></div>
                  {/* Socket Body */}
                  <div className="w-14 h-12 bg-gradient-to-r from-amber-900 via-yellow-600 to-amber-950 border-y-2 border-amber-950/80 shadow-[0_10px_20px_rgba(0,0,0,0.9)] flex items-center justify-around px-1.5 z-10">
                      {[1,2,3,4].map(i => <div key={i} className="w-[2px] h-full bg-amber-950/60 shadow-inner"></div>)}
                  </div>
                  {/* Socket Bottom Rim */}
                  <div className="w-12 h-2 bg-gradient-to-r from-zinc-800 via-zinc-600 to-zinc-900 rounded-b-sm shadow-inner z-10"></div>
                  
                  {/* Retro Edison Bulb */}
                  <div className={`relative flex justify-center items-center transition-all duration-[800ms] -mt-2 z-0
                      ${isLightOn ? 'shadow-[0_0_250px_100px_rgba(253,186,116,0.35)]' : ''}`}
                  >
                      {/* Bulb Glass Shape */}
                      <div className={`w-36 h-48 rounded-full rounded-b-[4rem] rounded-t-3xl border transition-all duration-[800ms] backdrop-blur-[1px]
                          ${isLightOn ? 'bg-gradient-to-b from-yellow-100/50 via-orange-200/20 to-transparent border-yellow-200/50 shadow-[inset_0_0_60px_rgba(253,224,71,0.6)]' : 'bg-gradient-to-b from-white/10 to-transparent border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.08)]'}`}
                      >
                         {/* Glass Reflection Highlight */}
                         <div className="absolute top-5 right-6 w-6 h-16 rounded-full bg-white/20 blur-[2px] transform rotate-12"></div>
                         <div className="absolute top-10 left-4 w-2 h-10 rounded-full bg-white/10 blur-[1px] transform -rotate-12"></div>
                         
                         {/* Bulb Inner Core & Filaments */}
                         <div className="absolute inset-0 flex flex-col items-center justify-start pt-3">
                             {/* Stem */}
                             <div className={`w-5 h-16 rounded-t-full transition-colors duration-500 ${isLightOn ? 'bg-orange-950/60' : 'bg-stone-800/90'}`}></div>
                             {/* Filament Wires */}
                             <div className="relative w-20 h-20 -mt-3">
                                 <div className={`absolute left-3 top-0 w-[2px] h-16 origin-bottom -rotate-12 transition-all duration-[400ms] ${isLightOn ? 'bg-orange-300 shadow-[0_0_15px_4px_#fb923c] blur-[0.5px]' : 'bg-stone-700'}`}></div>
                                 <div className={`absolute right-3 top-0 w-[2px] h-16 origin-bottom rotate-12 transition-all duration-[400ms] ${isLightOn ? 'bg-orange-300 shadow-[0_0_15px_4px_#fb923c] blur-[0.5px]' : 'bg-stone-700'}`}></div>
                                 <div className={`absolute left-0 right-0 top-0 h-[2px] transition-all duration-[400ms] ${isLightOn ? 'bg-[#fff5cc] shadow-[0_0_25px_8px_#fef08a] blur-[1px]' : 'bg-stone-600'}`}></div>
                             </div>
                         </div>
                      </div>
                  </div>

                  {/* Pull Chain (Beaded String) */}
                  <div 
                      className="absolute z-20 flex flex-col items-center cursor-pointer group px-16 pb-16 touch-none"
                      style={{ top: 'calc(22vh + 4.5rem)' }}
                      onMouseDown={() => { setIsPulling(true); setTimeout(() => setIsLightOn(true), 250); }} 
                      onMouseUp={() => setIsPulling(false)} 
                      onMouseLeave={() => setIsPulling(false)}
                      onTouchStart={() => { setIsPulling(true); setTimeout(() => setIsLightOn(true), 250); }} 
                      onTouchEnd={() => setIsPulling(false)}
                  >
                      {/* Decorative Beaded Chain */}
                      <div className={`w-1 flex flex-col items-center justify-start gap-[3px] transition-all duration-[400ms] overflow-hidden ${isPulling ? 'h-36' : 'h-20'}`}>
                          {[...Array(25)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-sm flex-shrink-0"></div>
                          ))}
                      </div>
                      
                      {/* Brass Pull Handle */}
                      <div className={`w-5 h-12 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-700 rounded-b-full rounded-t-sm shadow-[0_10px_20px_rgba(0,0,0,0.9)] border-b-[3px] border-amber-300 transition-transform duration-[400ms] flex items-end justify-center pb-1.5 z-30 ${isPulling ? 'translate-y-0 scale-95' : 'hover:scale-105 hover:brightness-110'}`}>
                          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-900 to-amber-700 shadow-inner"></div>
                      </div>
                      
                      <div className={`absolute -bottom-2 flex flex-col items-center transition-all duration-300 ${isLightOn ? 'opacity-0 scale-90' : 'animate-pulse opacity-100'}`}>
                          <p className="text-amber-500/80 font-mono text-[10px] tracking-[0.5em] font-black whitespace-nowrap mb-1">&#8595; PULL MEEEE</p>
                      </div>
                  </div>
              </div>
          </div>

          <div className={`transition-all duration-[1500ms] ease-out min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center ${isLightOn ? 'opacity-100 scale-100 blur-none' : 'opacity-0 scale-95 blur-xl pointer-events-none'}`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-500/30">
                        SC
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                        Smart Campus Hub
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-300">
                        Resource booking & facility management
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-slate-200/50 overflow-hidden">

                    <div className="flex border-b border-slate-200">
                        <button
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${loginType === 'USER' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                            onClick={() => { setLoginType('USER'); setError(''); }}
                        >
                            Student / User
                        </button>
                        <button
                            className={`flex-1 py-4 text-sm font-bold transition-colors ${loginType === 'STAFF' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500 hover:bg-slate-50'}`}
                            onClick={() => { setLoginType('STAFF'); setError(''); }}
                        >
                            Admin / Tech
                        </button>
                    </div>

                    <div className="p-8 sm:px-10">
                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 flex items-center text-red-700 text-sm border border-red-200">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {loginType === 'USER' ? (
                            <>
                                <div className="mb-8 text-center">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome Back</h3>
                                    <p className="text-slate-500 font-medium whitespace-break-spaces">
                                        Please sign in with your university {"\n"} Google Workspace account.
                                    </p>
                                </div>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full flex justify-center py-4 px-4 border-2 border-slate-200 rounded-2xl shadow-sm text-base font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all items-center hover:-translate-y-0.5"
                                    >
                                        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            <path fill="none" d="M1 1h22v22H1z" />
                                        </svg>
                                        Continue with Google
                                    </button>
                                </div>
                                <div className="mt-8 text-center text-xs font-medium text-slate-500 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="mb-2">For regular students/staff, accounts are automatically created upon first login.</p>
                                </div>
                            </>
                        ) : (
                            <form className="space-y-5" onSubmit={handleStaffLogin}>
                                <div className="mb-6 text-center">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">Staff Portal</h3>
                                    <p className="text-slate-500 font-medium">Log in to your administrative account</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                        placeholder="admin@university.edu"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
                                    />
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
                                            <LogIn className="w-5 h-5 mr-3" />
                                            Sign In
                                        </>
                                    )}
                                </button>

                                <div className="mt-6 text-center text-sm font-medium text-slate-500">
                                    No staff account?{' '}
                                    <Link to="/register" className="text-indigo-600 hover:text-indigo-500 hover:underline font-bold">
                                        Register here
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}
