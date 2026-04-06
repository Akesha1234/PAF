import { Link } from 'react-router-dom';
import { Search, Book, MessageSquare, Ticket, LifeBuoy, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SupportLanding() {
    return (
        <div className="font-sans bg-[#030303] text-white min-h-screen selection:bg-indigo-500/30">
            {/* Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />

            {/* Glass Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/40 backdrop-blur-xl border-b border-white/5 py-4 px-8 flex justify-between items-center transition-all duration-300">
                <Link to="/" className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                    <ArrowLeft className="w-4 h-4 text-white/70" />
                    <span className="text-white text-xs font-bold tracking-widest uppercase ml-1">Back to Home</span>
                </Link>

                <div className="flex items-center gap-4">
                    <Link to="/login" className="bg-white text-black hover:bg-gray-100 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Portal Login <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-40 md:pt-48 pb-20 px-8 flex flex-col items-center justify-center text-center max-w-4xl mx-auto z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-blue-300 mb-8">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>24/7 Global Support</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">How can we</span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Help you?</span>
                </h1>
                
                {/* Huge Search Bar */}
                <div className="w-full relative mt-6 mb-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search for guides, troubleshooting, or FAQs..." 
                        className="w-full bg-[#12141a] border border-white/10 text-lg text-white px-8 py-6 pl-16 rounded-3xl focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-gray-600 shadow-2xl hover:border-white/20"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-colors">
                        Search
                    </button>
                </div>
            </div>

            {/* Support Categories Bento Grid */}
            <div className="max-w-6xl mx-auto px-8 pb-32 z-10 relative animate-in fade-in slide-in-from-bottom-12 duration-[1500ms]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Card 1 */}
                    <div className="rounded-[2rem] bg-[#0c0d12] border border-white/5 p-8 flex flex-col justify-between group transition-all hover:bg-[#12141a] hover:border-blue-500/30 cursor-pointer">
                        <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 overflow-hidden relative">
                            <Book className="w-6 h-6 text-blue-400 relative z-10 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-white">Knowledge Base</h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">Browse hundreds of articles, tutorials, and setup guides for campus network and systems.</p>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                Browse Guides <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <Link to="/login" className="rounded-[2rem] bg-gradient-to-br from-[#181a20] to-[#12141a] dark:from-[#12141c] dark:to-[#0a0b10] border border-white/10 p-8 flex flex-col justify-between group transition-all hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] transition-all group-hover:bg-indigo-500/20" />
                        <div className="w-14 h-14 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                            <Ticket className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-3 text-white">Submit a Ticket</h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">Need technical assistance? Log in to your portal to submit a maintenance or IT incident ticket directly.</p>
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                Open Portal <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </Link>

                    {/* Card 3 */}
                    <div className="rounded-[2rem] bg-[#0c0d12] border border-white/5 p-8 flex flex-col justify-between group transition-all hover:bg-[#12141a] hover:border-purple-500/30 cursor-pointer">
                        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                            <MessageSquare className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-3 text-white">Live Operations Chat</h3>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium mb-6">Chat with our 24/7 technical operations team for urgent system outages and critical failures.</p>
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                Start Chat <ArrowRight className="w-3 h-3" />
                            </span>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Minimal Footer */}
            <div className="border-t border-white/5 py-8 text-center bg-black/50">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} Smart Campus Operations. Support Division.
                </span>
            </div>
        </div>
    );
}
