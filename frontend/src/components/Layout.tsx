import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Calendar as CalendarIcon, LayoutDashboard, Wrench, Bell, LogOut, Database, User, Search, Settings, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import api from '../services/api';
import AIAssistant from './AIAssistant';

export default function Layout() {
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    // In a real app, this would come from a global auth context
    const role = localStorage.getItem('userRole') || 'ADMIN';
    const userName = localStorage.getItem('userName') || 'User';
    const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
        { name: 'Facilities & Assets', href: '/resources', icon: LayoutDashboard, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
        { name: 'My Bookings', href: '/bookings', icon: CalendarIcon, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
        { name: 'Ticketing', href: '/tickets', icon: Wrench, roles: ['USER', 'ADMIN', 'TECHNICIAN'] },
    ];

    const adminNavigation = [
        { name: 'Admin Panel', href: '/admin/panel', icon: LayoutDashboard },
        { name: 'Incident Assignment', href: '/admin/tickets', icon: Wrench },
        { name: 'Facilities Management', href: '/admin/assets', icon: Database },
        { name: 'Users', href: '/admin/users', icon: Settings },
    ];

    const filteredNav = navigation.filter(n => n.roles.includes(role));

    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState<any>(null);
    const [lastNotifiedId, setLastNotifiedId] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            const data = res.data;
            setNotifications(data);
            
            const countRes = await api.get('/notifications/unread-count');
            const count = countRes.data.count;
            
            // Check for new unread notifications to trigger toast
            if (data.length > 0) {
                const newest = data[0];
                if (!newest.read && newest.id !== lastNotifiedId) {
                    setLatestNotification(newest);
                    setLastNotifiedId(newest.id);
                    // Clear toast after 6 seconds
                    setTimeout(() => setLatestNotification(null), 6000);
                }
            }
            
            setUnreadCount(count);
        } catch (e) {
            console.error('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await api.patch(`/notifications/${id}/read`);
            await fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all', {});
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    return (
        <div className="flex h-screen bg-[#12141a] text-slate-200 font-sans">
            {/* Sidebar */}
            <div className="w-[260px] bg-[#181a20] border-r border-[#262832] flex-col hidden md:flex z-50">
                <div className="px-6 flex items-center space-x-3 h-20 border-b border-transparent">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_10px_rgba(59,130,246,0.4)]">
                        SC
                    </div>
                    <span className="text-lg font-bold text-slate-100 tracking-tight">
                        Smart Campus 
                    </span>
                    <div className="ml-auto flex items-center">
                        <div className="w-6 h-6 rounded-full bg-[#262832] flex items-center justify-center cursor-pointer hover:bg-slate-700 transition">
                            <div className="w-3 h-3 border-4 border-transparent border-l-slate-400 rotate-45 rounded-sm"></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                    <div className="px-8 mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Main</div>
                    <nav className="px-4 space-y-1.5 mb-8">
                        {filteredNav.map((item) => {
                            const isActive = location.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${isActive
                                        ? 'bg-blue-50 dark:bg-[#212533] text-blue-400 border border-blue-500/10'
                                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className={`w-[18px] h-[18px] mr-3 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                                        {item.name}
                                    </div>
                                </Link>
                            );
                        })}
                        {/* Mock items from screenshot */}
                        <Link to="/kanban" className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${location.pathname.startsWith('/kanban') ? 'bg-blue-50 dark:bg-[#212533] text-blue-400 border border-blue-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 border border-transparent'}`}>
                            <div className="flex items-center"><Database className={`w-[18px] h-[18px] mr-3 ${location.pathname.startsWith('/kanban') ? 'text-blue-400' : 'text-slate-500'}`} /> Kanban Board</div>
                            <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">New</span>
                        </Link>
                        <Link to="/analytics" className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${location.pathname.startsWith('/analytics') ? 'bg-blue-50 dark:bg-[#212533] text-blue-400 border border-blue-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 border border-transparent'}`}>
                            <div className="flex items-center"><LayoutDashboard className={`w-[18px] h-[18px] mr-3 ${location.pathname.startsWith('/analytics') ? 'text-blue-400' : 'text-slate-500'}`} /> Analytics</div>
                            <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">New</span>
                        </Link>
                        <Link to="/calendar" className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${location.pathname.startsWith('/calendar') ? 'bg-blue-50 dark:bg-[#212533] text-blue-400 border border-blue-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 border border-transparent'}`}>
                            <div className="flex items-center"><CalendarIcon className={`w-[18px] h-[18px] mr-3 ${location.pathname.startsWith('/calendar') ? 'text-blue-400' : 'text-slate-500'}`} /> Calendar</div>
                            <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold">New</span>
                        </Link>
                    </nav>

                    {role === 'ADMIN' && (
                        <>
                            <div className="px-8 mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Admin</div>
                            <nav className="px-4 space-y-1.5 mb-8">
                                {adminNavigation.map((item) => {
                                    const isActive = location.pathname.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${isActive
                                                ? 'bg-blue-50 dark:bg-[#212533] text-amber-400 border border-amber-500/10'
                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 border border-transparent'
                                                }`}
                                        >
                                            <item.icon className={`w-[18px] h-[18px] mr-3 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </>
                    )}
                    
                    <div className="px-8 mb-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">Account</div>
                    <nav className="px-4 space-y-1.5 pb-6">
                        <Link to="/profile" className="flex items-center px-4 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533] hover:text-slate-200 transition-colors">
                            <User className="w-[18px] h-[18px] mr-3 text-slate-500" />
                            Profile
                        </Link>
                        <Link to="/login" className="flex items-center px-4 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                            <LogOut className="w-[18px] h-[18px] mr-3 text-slate-500" />
                            Sign Out
                        </Link>
                    </nav>
                </div>
                
                {/* User Info Bottom */}
                <div className="p-5 border-t border-[#262832] flex items-center space-x-3 bg-[#181a20]">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#262832] flex items-center justify-center font-bold text-slate-200 text-sm shadow-inner">
                            {userInitials || <User className="w-5 h-5" />}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#181a20] rounded-full"></span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-200 leading-tight">{userName}</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{role}</p>
                    </div>
                    <div className="ml-auto">
                         <Link to="/profile" className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-300 cursor-pointer transition-colors block">
                            <Wrench className="w-4 h-4" />
                         </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Global Toast Notification */}
                {latestNotification && (
                    <div className="fixed top-24 right-8 z-[1000] animate-in slide-in-from-right-10 duration-500 max-w-sm">
                        <div className="bg-[#181a20] border border-blue-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="bg-blue-600/10 border-b border-blue-500/20 px-4 py-2 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">System Alert</span>
                                </div>
                                <button onClick={() => setLatestNotification(null)} className="text-slate-500 hover:text-white">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h5 className="text-[13px] font-black text-slate-100 mb-1">{latestNotification.title}</h5>
                                <p className="text-[11px] font-medium text-slate-400 leading-normal">{latestNotification.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header */}
                <header className="h-20 bg-[#181a20] border-b border-[#262832] flex items-center justify-between px-8 z-30">
                    {/* Header Left / Search */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-500" />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-[#12141a] border border-[#212533] text-slate-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:border-[#2b2e3b] transition-colors text-[13px] placeholder-slate-600"
                                placeholder="Search resources, bookings, tickets..."
                            />
                        </div>
                    </div>

                    {/* Header Right */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden lg:flex items-center space-x-4 text-xs font-semibold text-slate-400 mr-2">
                            <div className="flex items-center text-[11px] min-w-[70px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                            <button onClick={toggleTheme} className="flex items-center bg-white dark:bg-[#12141a] border border-slate-200 dark:border-[#262832] hover:bg-slate-100 dark:hover:bg-[#1a1c23] transition-colors px-3 py-1.5 rounded-full text-[11px] cursor-pointer">
                                {isDarkMode ? (
                                    <><span className="text-yellow-500 mr-1.5 text-[10px]">🌙</span>Dark</>
                                ) : (
                                    <><span className="text-amber-500 mr-1.5 text-[12px]">☀️</span>Light</>
                                )}
                            </button>
                            <div className="flex items-center -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-[#181a20] flex items-center justify-center text-[8px] text-white">AS</div>
                                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#181a20] flex items-center justify-center text-[8px] text-white">AG</div>
                                <div className="w-6 h-6 rounded-full bg-[#262832] border-2 border-[#181a20] flex items-center justify-center text-[10px] text-slate-400">+</div>
                            </div>
                        </div>

                        <div className="flex items-center bg-[#12141a] rounded-full p-1 border border-[#262832]">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-1.5 text-slate-400 hover:text-slate-200 rounded-full transition-colors"
                            >
                                <Bell className="w-4 h-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block h-1.5 w-1.5 rounded-full bg-yellow-500 ring-2 ring-[#12141a]" />
                                )}
                            </button>
                        </div>
                        
                        {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-[#1c1e26] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#2b2d38] overflow-hidden animate-in fade-in slide-in-from-top-4 origin-top-right z-50">
                                    <div className="p-4 border-b border-[#2b2d38] bg-[#181a20] flex justify-between items-center">
                                        <h4 className="font-bold text-slate-200">Notifications</h4>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md tracking-wider uppercase">{unreadCount} New</span>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar bg-[#1c1e26]">
                                        {notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={(e) => {
                                                    if (!n.read) markAsRead(n.id, e);
                                                }}
                                                className={`p-4 border-b border-[#2b2d38]/50 hover:bg-[#242631] transition-colors cursor-pointer ${!n.read ? 'bg-blue-900/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'}`}
                                            >
                                                <p className={`text-sm font-medium mb-1.5 ${!n.read ? 'text-slate-200' : 'text-slate-400'}`}>{n.message}</p>
                                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                                    {n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : 'Recently'}
                                                </p>
                                            </div>
                                        ))}
                                        {notifications.length === 0 && (
                                            <div className="p-8 text-center text-slate-500 text-sm font-medium">
                                                No notifications
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 text-center border-t border-[#2b2d38] bg-[#181a20] flex gap-2 overflow-hidden">
                                        <button onClick={markAllAsRead} className="flex-1 py-1.5 text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors uppercase tracking-wide">Mark as read</button>
                                        <Link to="/notifications" onClick={() => setShowNotifications(false)} className="flex-1 py-1.5 text-[11px] font-bold text-slate-400 bg-[#262832] border border-transparent rounded-lg hover:bg-[#2c2f3a] transition-colors uppercase tracking-wide">View All</Link>
                                    </div>
                                </div>
                            )}

                        <Link to="/profile" className="flex items-center space-x-2.5 pl-4 ml-1">
                            <span className="text-xs font-semibold text-slate-300 hidden md:block">{userName}</span>
                            <div className="w-8 h-8 rounded-full bg-blue-900/40 border-2 border-[#262832] flex items-center justify-center font-bold text-blue-400 text-xs shadow-inner">
                                {userInitials ? <span>{userInitials}</span> : <User className="w-4 h-4" />}
                            </div>
                        </Link>
                        
                        <Link to="/resources?action=book" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-[0_4px_10px_rgba(59,130,246,0.3)] border-b-2 border-blue-600 flex items-center inline-block cursor-pointer">
                            <span className="mr-1">+</span> Book
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-[#12141a] p-6 md:p-8 custom-scrollbar text-slate-300">
                    <Outlet />
                </main>
            </div>
            {/* Global AI Chatbot Widget */}
            <AIAssistant />
        </div>
    );
}
