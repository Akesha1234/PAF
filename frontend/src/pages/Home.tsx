import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Building2, Ticket, CheckCircle2, ChevronRight, Globe2, BookOpen, Fingerprint } from 'lucide-react';

const SHOWCASE_IMAGES = [
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2070', title: 'World-Class Architecture' },
    { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000', title: 'Modern Workspaces' },
    { url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000', title: 'State-of-the-Art Labs' },
    { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000', title: 'Connected Library' },
];

const HERO_BACKGROUNDS = [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070', // Tech/Office
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2070', // Architecture
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2071', // Students Working
    'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=2000', // Modern Space
];

export default function Home() {
    const [currentImage, setCurrentImage] = useState(0);
    const [currentHero, setCurrentHero] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }

        const timer1 = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % SHOWCASE_IMAGES.length);
        }, 5000); // 5 seconds per slide

        const timer2 = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
        }, 6000); // 6 seconds for hero bg

        return () => {
            clearInterval(timer1);
            clearInterval(timer2);
        };
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    return (
        <div className="font-sans bg-[#030303] text-white min-h-screen selection:bg-indigo-500/30">
            {/* Dynamic Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none z-0" />

            {/* Sliding Hero Backgrounds */}
            <div className="absolute inset-0 z-0 overflow-hidden h-[80vh] md:h-screen pointer-events-none mask-image-gradient">
                {HERO_BACKGROUNDS.map((bg, idx) => (
                    <div 
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-30' : 'opacity-0'}`}
                    >
                        <img 
                            src={bg} 
                            alt={`Hero Background ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transform transition-transform ease-out mix-blend-luminosity duration-[15000ms] ${idx === currentHero ? 'scale-110' : 'scale-100'}`}
                        />
                    </div>
                ))}
                {/* Gradient overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/60 via-[#030303]/80 to-[#030303] z-10" />
            </div>

            {/* Glass Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/40 backdrop-blur-xl border-b border-white/5 py-4 px-8 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform duration-300">
                        SC
                    </div>
                    <span className="text-white text-xs font-bold tracking-widest uppercase ml-2">Smart Campus</span>
                </div>

                <div className="hidden md:flex items-center space-x-12 text-xs font-semibold tracking-widest uppercase">
                    <Link to="/" className="text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Home</Link>
                    <Link to="/about" className="text-white/60 hover:text-indigo-400 transition-colors">About</Link>
                    <Link to="/support" className="text-white/60 hover:text-indigo-400 transition-colors">Support</Link>
                    <Link to="/contact" className="text-white/60 hover:text-indigo-400 transition-colors">Contact</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-200 hover:scale-110 transition-transform">
                        {isDarkMode ? '🌙' : '☀️'}
                    </button>
                    <Link to="/login" className="text-white/70 hover:text-white font-bold text-xs tracking-wider transition-colors px-2">
                        Sign In
                    </Link>
                    <Link to="/login" className="bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-100 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Portal <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-40 md:pt-56 pb-20 px-8 flex flex-col items-center justify-center text-center max-w-6xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 mb-8">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next Generation Education Platform</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter leading-[0.9] mb-8">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Experience</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">The Future.</span>
                </h1>
                
                <p className="text-sm md:text-base text-gray-400 max-w-2xl font-medium leading-relaxed mb-10 tracking-wide">
                    A breathtaking digital ecosystem designed exclusively for modern scholars. 
                    Manage classes, reserve spaces, and submit tickets through one incredibly intuitive workspace.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/register" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105">
                        Get Started Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/about" className="h-14 px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:border-white/20">
                        Discover More
                    </Link>
                </div>
            </div>

            {/* Beautiful Bento Grid */}
            <div className="max-w-7xl mx-auto px-8 py-20 z-10 relative animate-in fade-in slide-in-from-bottom-12 duration-[1500ms]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
                    
                    {/* Big Bento Card */}
                    <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-[#181a20] to-[#12141a] dark:from-[#12141c] dark:to-[#0a0b10] border border-white/5 p-10 flex flex-col justify-between group overflow-hidden relative transition-all hover:border-indigo-500/30">
                        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] transition-all group-hover:bg-indigo-500/20" />
                        <div className="relative z-10 w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10">
                            <Building2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-3">Live Resource Booking</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">Instantly reserve lecture halls, study pods, and equipment in real-time. Unprecedented control over your academic journey.</p>
                        </div>
                        {/* Decorative UI element */}
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-[2rem] bg-indigo-500/5 border border-white/5 rotate-12 transition-transform group-hover:rotate-6 flex flex-col p-6 gap-3">
                            <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse"></div>
                            <div className="w-3/4 h-12 bg-white/5 rounded-xl animate-pulse delay-75"></div>
                            <div className="w-1/2 h-12 bg-white/5 rounded-xl animate-pulse delay-150"></div>
                        </div>
                    </div>

                    {/* Small Bento 1 */}
                    <div className="rounded-[2rem] bg-[#0c0d12] border border-white/5 p-10 flex flex-col justify-between group transition-all hover:border-purple-500/30">
                        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Rapid Support</h3>
                            <p className="text-gray-400 text-xs leading-relaxed font-medium">Submit IT & campus tickets instantly with automated triage algorithms.</p>
                        </div>
                    </div>

                    {/* Small Bento 2 */}
                    <div className="rounded-[2rem] bg-[#0c0d12] border border-white/5 p-10 flex flex-col justify-between group transition-all hover:border-emerald-500/30">
                        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Unified Tracking</h3>
                            <p className="text-gray-400 text-xs leading-relaxed font-medium">Your entire academic schedule dynamically monitored directly on your dashboard.</p>
                        </div>
                    </div>

                    {/* Big Image Bento */}
                    <div className="md:col-span-2 rounded-[2rem] bg-black border border-white/5 overflow-hidden group relative transition-all hover:border-white/10">
                        <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 mix-blend-luminosity" alt="Campus Architecture" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-x-0 bottom-0 p-10 z-10">
                            <h3 className="text-3xl font-bold mb-2">Architecture that Inspires</h3>
                            <p className="text-gray-300 text-sm font-medium w-3/4">We've merged breathtaking physical environments with the most robust digital platform available to students worldwide.</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Dynamic Image Slider Section */}
            <div className="relative w-full max-w-7xl mx-auto px-8 mb-32 z-10 transition-all duration-1000">
                <div className="mb-10 flex flex-col items-center">
                    <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Campus Showcase</h2>
                    <p className="text-gray-400 text-sm mt-3 font-medium uppercase tracking-widest">Breathtaking spaces designed for future leaders</p>
                </div>
                <div className="relative w-full h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                    {SHOWCASE_IMAGES.map((img, idx) => (
                        <div 
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${idx === currentImage ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img 
                                src={img.url} 
                                className={`absolute inset-0 w-full h-full object-cover transform transition-transform duration-[8000ms] ease-out opacity-80 ${idx === currentImage ? 'scale-105' : 'scale-100'}`} 
                                alt={img.title}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
                            <div className={`absolute bottom-12 left-12 transition-all duration-1000 transform z-20 ${idx === currentImage ? 'translate-y-0 opacity-100 delay-500' : 'translate-y-10 opacity-0'}`}>
                                <p className="text-[12px] font-black tracking-[0.3em] text-indigo-400 uppercase mb-3">Facility Overview</p>
                                <h3 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-2xl">{img.title}</h3>
                            </div>
                        </div>
                    ))}

                    {/* Slider Navigation Dots */}
                    <div className="absolute bottom-10 right-12 flex gap-4 z-20">
                        {SHOWCASE_IMAGES.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentImage(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentImage ? 'w-16 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Massive Call to Action */}
            <div className="relative overflow-hidden py-32 mb-20">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-[2px] pointer-events-none">
                     <h2 className="text-[20vw] font-black leading-none whitespace-nowrap text-white" style={{WebkitTextStroke: '2px currentColor', color: 'transparent'}}>READY YET?</h2>
                </div>
                <div className="relative z-10 text-center flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Step into the Modern Era.</h2>
                    <p className="text-gray-400 mb-10 max-w-lg text-sm font-medium">Join thousands of students leveraging our next-generation campus operations suite to maximize their true academic potential.</p>
                    <Link to="/register" className="h-16 px-10 bg-white text-black hover:bg-gray-200 rounded-full font-black flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 uppercase tracking-widest text-xs">
                        Create Your Account <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 pt-20 pb-10 px-8 relative bg-black/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16 md:gap-12 pl-4">
                    <div className="w-full md:w-1/3">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg border border-indigo-500/30">
                                <span className="text-[10px] font-black text-white">SC</span>
                            </div>
                            <span className="text-white text-xs font-bold tracking-[0.2em] uppercase ml-1">Smart Campus</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">
                            Redefining the university experience through technological innovation, flawless design, and user-centric operations.
                        </p>
                    </div>

                    <div className="w-full md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-12">
                        <div>
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Product</h4>
                            <ul className="space-y-5 text-xs font-semibold text-gray-400">
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Booking System</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Support Tickets</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Integrations</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Pricing</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Resources</h4>
                            <ul className="space-y-5 text-xs font-semibold text-gray-400">
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Help Center</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Documentation</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Community</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">API Reference</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Company</h4>
                            <ul className="space-y-5 text-xs font-semibold text-gray-400">
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">About Story</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Careers</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Brand Book</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6">Legal</h4>
                            <ul className="space-y-5 text-xs font-semibold text-gray-400">
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Terms of Service</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy Policy</li>
                                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Security</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
                    <div className="flex gap-8">
                        <Globe2 className="w-5 h-5 text-gray-600 hover:text-white cursor-pointer transition-colors" />
                        <BookOpen className="w-5 h-5 text-gray-600 hover:text-white cursor-pointer transition-colors" />
                        <Fingerprint className="w-5 h-5 text-gray-600 hover:text-white cursor-pointer transition-colors" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] text-center max-w-sm">
                        © {new Date().getFullYear()} Smart Campus Operations. All rights reserved globally.
                    </span>
                </div>
            </footer>
        </div>
    );
}
