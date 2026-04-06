import { useState, useEffect } from 'react';
import { User, Mail, Shield, Camera, Save, Lock, ChevronRight, Bell, Settings as SettingsIcon, AlertCircle } from 'lucide-react';

export default function Profile() {
    const [userName, setUserName] = useState(localStorage.getItem('userName') || 'User');
    const email = localStorage.getItem('userEmail') || 'user@campus.edu';
    const role = localStorage.getItem('userRole') || 'USER';
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('Profile Info');

    // Placeholder for actual data fetching if backend supports profile
    useEffect(() => {
        // Fetch real user data here if available
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            localStorage.setItem('userName', userName);
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 1000);
    };

    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const tabs = [
        { name: 'Profile Info', icon: User },
        { name: 'Security', icon: Lock },
        { name: 'Notifications', icon: Bell },
        { name: 'Preferences', icon: SettingsIcon }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-12 font-sans text-slate-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Account Settings</h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">Manage your profile & security</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-xl p-8 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative inline-block mb-6">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-black border-4 border-[#181a20] shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                                {userInitials}
                            </div>
                            <button onClick={() => alert("Profile picture upload feature coming soon.")} className="absolute bottom-1 right-1 p-2.5 bg-[#262832] rounded-full shadow-lg border border-slate-700 text-indigo-400 hover:text-white hover:bg-indigo-500 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-extrabold text-white text-xl tracking-tight">{userName}</h3>
                        <p className="text-xs text-slate-400 font-medium mb-5">{email}</p>
                        <div className="inline-flex items-center px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                            <Shield className="w-3.5 h-3.5 mr-2" /> {role}
                        </div>
                    </div>

                    <nav className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-xl overflow-hidden py-2">
                        {tabs.map((tab) => (
                            <button 
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-all ${activeTab === tab.name ? 'text-indigo-400 border-l-4 border-indigo-500 bg-white/[0.02]' : 'text-slate-500 border-l-4 border-transparent hover:bg-white/[0.02] hover:text-slate-300'}`}
                            >
                                <div className="flex items-center tracking-wide">
                                    <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.name ? 'text-indigo-400' : 'text-slate-600'}`} /> 
                                    {tab.name}
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.name ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {activeTab === 'Profile Info' && (
                        <div className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-8 border-b border-[#262832]/80 bg-gradient-to-r from-white/[0.02] to-transparent">
                                <h3 className="font-extrabold text-white text-xl tracking-tight mb-1">General Information</h3>
                                <p className="text-xs font-medium text-slate-500">Update your account details and how others see you.</p>
                            </div>
                            <form onSubmit={handleSave} className="p-8 space-y-8">
                                {saveSuccess && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold flex items-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                        <Shield className="w-5 h-5 mr-3" /> Profile updated successfully!
                                    </div>
                                )}

                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                value={userName}
                                                onChange={e => setUserName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-white shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Email Address</label>
                                        <div className="relative opacity-60">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                readOnly
                                                className="w-full pl-11 pr-4 py-3 bg-[#12141a]/50 border border-[#262832] rounded-xl outline-none font-medium text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-[9px] text-amber-500 mt-2 font-black uppercase tracking-widest flex items-center">
                                            <AlertCircle className="w-3 h-3 mr-1" /> Contact admin to change email
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">User Bio (Optional)</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Write a little about yourself, your department, or role..."
                                        className="w-full px-5 py-4 bg-[#12141a] border border-[#262832] rounded-xl focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium text-white resize-none shadow-inner placeholder-slate-600"
                                    />
                                </div>

                                <div className="pt-6 border-t border-[#262832]/50 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-8 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black tracking-widest uppercase text-[11px] rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                        ) : (
                                            <Save className="w-4 h-4 mr-3" />
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-xl overflow-hidden animate-in fade-in duration-300">
                            <div className="p-8 border-b border-[#262832]/80 bg-gradient-to-r from-white/[0.02] to-transparent">
                                <h3 className="font-extrabold text-white text-xl tracking-tight mb-1">Account Security</h3>
                                <p className="text-xs font-medium text-slate-500">Manage your password and authentication methods.</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#12141a] rounded-2xl border border-[#262832] group hover:border-[#383a44] transition-colors">
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <div className="p-3 bg-[#181a20] rounded-xl border border-[#262832] mr-5 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">Password</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">Last changed 3 months ago</p>
                                        </div>
                                    </div>
                                    <button onClick={() => alert("Password update instructions sent.")} className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 rounded-xl transition-all border border-indigo-500/20">Update</button>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#12141a] rounded-2xl border border-[#262832] group hover:border-[#383a44] transition-colors">
                                    <div className="flex items-center mb-4 sm:mb-0">
                                        <div className="p-3 bg-[#181a20] rounded-xl border border-[#262832] mr-5 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200">Two-Factor Authentication</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1 flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1 text-amber-500" /> Not enabled yet
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => alert("2FA activation initiated.")} className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 rounded-xl transition-all border border-emerald-500/20">Enable</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {['Notifications', 'Preferences'].includes(activeTab) && (
                        <div className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-xl overflow-hidden p-12 text-center animate-in fade-in duration-300">
                            <div className="inline-flex items-center justify-center p-4 bg-[#12141a] rounded-2xl border border-[#262832] mb-4">
                                <SettingsIcon className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="font-extrabold text-white text-xl tracking-tight mb-2">Coming Soon</h3>
                            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                                We are working on adding more configuration options for your {activeTab.toLowerCase()}. Check back later!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
