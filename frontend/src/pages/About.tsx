import { Users, Target, Shield, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Hero */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/30 blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-3xl opacity-50 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        We are building the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">Campus of Tomorrow</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Bridging the gap between students, educators, and campus facilities to ensure seamless daily operations.
                    </p>
                    <Link to="/" className="inline-flex items-center text-indigo-300 hover:text-indigo-100 font-bold transition-colors animate-in fade-in zoom-in-95 duration-700 delay-200">
                        Back to Home <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            Smart Campus Hub was founded with a singular purpose: to eliminate the friction from university operations. From double-booked lecture halls to untracked maintenance requests, campuses lose thousands of hours annually. We provide a centralized, transparent platform where facility handling happens in clicks, not forms.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We believe that when technology handles the logistics invisibly, students and educators can focus on what truly matters: learning, research, and innovation.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-[2.5rem] transform rotate-3"></div>
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" alt="Team Collaboration" className="relative rounded-[2rem] shadow-2xl object-cover h-[450px] w-full" />
                    </div>
                </div>

                {/* Core Values */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">Core Values</h2>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">What drives our innovation and development.</p>
                </div>

                <div className="grid md:grid-cols-4 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                            <Users className="w-7 h-7 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">User-Centric</h3>
                        <p className="text-slate-600">Built for the student waking up at 8 AM, and the admin working til 8 PM.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                            <Target className="w-7 h-7 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Precision</h3>
                        <p className="text-slate-600">Zero double-bookings. Live real-time updates for complete accuracy.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                            <Shield className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Reliability</h3>
                        <p className="text-slate-600">99.9% uptime SLA. We are here when the campus needs us most.</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
                            <Zap className="w-7 h-7 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                        <p className="text-slate-600">Optimized workflows to ensure reservations take seconds, not minutes.</p>
                    </div>
                </div>
            </div>

            <footer className="py-8 bg-white border-t border-slate-200 text-center">
                <p className="text-slate-400 font-medium">© 2026 Smart Campus Operations Hub. All rights reserved.</p>
            </footer>
        </div>
    );
}
