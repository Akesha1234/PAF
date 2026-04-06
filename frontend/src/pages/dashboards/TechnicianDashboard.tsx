import { Activity, AlertCircle, Calendar, CheckCircle, Clock, Navigation, Database, Wrench, FileText, Settings, Bell, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TechnicianDashboard() {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({
        open: 0,
        inProgress: 0,
        resolved: 0,
        assignedToMe: 0,
        personalBookings: 0,
        personalTickets: 0
    });
    const [activeTickets, setActiveTickets] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const uid = localStorage.getItem('userId');
        setUserId(uid);

        const fetchTickets = async () => {
            try {
                const userId = localStorage.getItem('userId');
                const [ticketsRes, bookingsRes, notifRes] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/bookings'),
                    api.get('/notifications').catch(() => ({ data: [] }))
                ]);

                const allTks = ticketsRes.data || [];
                const allBkgs = bookingsRes.data || [];
                const allNotifs = notifRes.data || [];
                setNotifications(allNotifs.slice(0, 3));

                // Tickets for the technician's queue (Assigned to them OR open/unassigned)
                const myAssignedTks = allTks.filter((t: any) => t.assigneeId === userId);
                const unassignedOpenTks = allTks.filter((t: any) => !t.assigneeId && t.status === 'OPEN');
                const poolTks = [...myAssignedTks, ...unassignedOpenTks];

                // Personal stats (actions as a USER)
                const myPersonalBkgs = allBkgs.filter((b: any) => b.userId === userId);
                const myPersonalTks = allTks.filter((t: any) => t.reporterId === userId);

                setStatsData({
                    open: unassignedOpenTks.length,
                    inProgress: myAssignedTks.filter((t: any) => t.status === 'IN_PROGRESS').length,
                    resolved: myAssignedTks.filter((t: any) => t.status === 'RESOLVED').length,
                    assignedToMe: myAssignedTks.filter((t: any) => t.status !== 'RESOLVED').length,
                    personalBookings: myPersonalBkgs.length,
                    personalTickets: myPersonalTks.length
                });

                setActiveTickets(poolTks.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS')
                    .sort((a: any, b: any) => a.status === 'IN_PROGRESS' ? -1 : (b.status === 'IN_PROGRESS' ? 1 : 0))
                    .slice(0, 5));
            } catch (e) { console.error(e); }
        };
        fetchTickets();
    }, []);



    const stats = [
        { name: 'Assigned to Me', value: statsData.assignedToMe.toString(), icon: Wrench, color: 'text-indigo-600', bg: 'bg-indigo-50', text: 'Active tasks', link: '/tickets' },
        { name: 'My Bookings', value: statsData.personalBookings.toString(), icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Personal', link: '/bookings' },
        { name: 'My Tickets', value: statsData.personalTickets.toString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', text: 'Support cases', link: '/tickets' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[#262832] pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <Wrench className="w-6 h-6 mr-2 text-slate-300" />
                        Technician Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">1. Welcome back, Technician. View your active tasks.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/resources?action=book" className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                        <Calendar className="w-4 h-4 mr-2" /> Book Resource
                    </Link>
                    <button onClick={() => navigate('/tickets', { state: { openReport: true } })} className="flex items-center px-4 py-2.5 bg-[#181a20] border border-[#262832] text-slate-300 rounded-xl font-bold shadow-sm hover:bg-[#12141a] hover:-translate-y-0.5 transition-all">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-500" /> Report Issue
                    </button>
                    <div className="hidden lg:flex items-center px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl font-medium shadow-sm">
                        <Activity className="w-4 h-4 mr-2" />
                        Status: Online
                    </div>
                </div>
            </div>

            {/* 3. Priority Matrix (Simplified as Stats) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                    <Link to={item.link} key={item.name} className="block bg-[#181a20] rounded-2xl shadow-sm border border-[#262832] p-5 flex flex-col hover:border-indigo-300 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2.5 rounded-xl ${item.bg}`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 bg-[#12141a] px-2 py-1 rounded-md">{item.text}</span>
                        </div>
                        <dt className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{item.name}</dt>
                        <dd className="text-3xl font-bold text-white group-hover:text-amber-600 transition-colors">{item.value}</dd>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content Area (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 2. Assigned Tickets Queue */}
                    <div className="bg-[#181a20] rounded-2xl shadow-sm border border-[#262832] overflow-hidden">
                        <div className="p-5 border-b border-[#262832] flex justify-between items-center bg-[#12141a]/50">
                            <h3 className="text-lg font-bold text-slate-200 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                                2. Active Queue
                            </h3>
                            <Link to="/tickets" className="text-xs font-bold text-indigo-600 hover:underline">Go to Kanban Board</Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {activeTickets.length === 0 ? <p className="p-4 text-sm text-slate-500">No active tickets.</p> :
                                activeTickets.map((t) => (
                                    <div key={t.id} className="p-4 flex flex-col sm:flex-row justify-between items-start hover:bg-[#12141a] transition-colors">
                                        <div className="mb-3 sm:mb-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.priority === 'CRITICAL' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                                                    {t.priority}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">{(t.id as string).substring(0, 8)}</span>
                                                {t.assigneeId === userId ? (
                                                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">MY TASK</span>
                                                ) : (
                                                    <span className="bg-[#262832] text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">POOL</span>
                                                )}
                                                {t.status === 'IN_PROGRESS' && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">WORKING</span>}
                                            </div>
                                            <h4 className="font-bold text-slate-200 text-sm mb-1">{t.title}</h4>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center"><Navigation className="w-3 h-3 mr-1" /> {t.resourceName || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                                            {t.status === 'OPEN' ? (
                                                <button onClick={async () => {
                                                    const userId = localStorage.getItem('userId');
                                                    try {
                                                        await api.patch(`/tickets/${t.id}/status`, { status: "IN_PROGRESS", assigneeId: userId });
                                                        setStatsData(prev => ({ ...prev, open: Math.max(0, prev.open - 1), inProgress: prev.inProgress + 1 }));
                                                        setActiveTickets(prev => prev.map(tick => tick.id === t.id ? { ...tick, status: 'IN_PROGRESS', assigneeId: userId } : tick).sort((a: any, b: any) => a.status === 'IN_PROGRESS' ? -1 : (b.status === 'IN_PROGRESS' ? 1 : 0)));
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert("Failed to start work");
                                                    }
                                                }} className="flex items-center justify-center sm:w-32 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                                                    <Play className="w-3 h-3 mr-1.5" /> Start Work
                                                </button>
                                            ) : (
                                                <button onClick={async () => {
                                                    try {
                                                        await api.patch(`/tickets/${t.id}/status`, { status: "RESOLVED", resolutionNotes: "Resolved via dashboard" });
                                                        setStatsData(prev => ({ ...prev, inProgress: Math.max(0, prev.inProgress - 1), resolved: prev.resolved + 1 }));
                                                        setActiveTickets(prev => prev.filter(tick => tick.id !== t.id)); // Remove from active queue on resolve
                                                        alert("Ticket successfully resolved!");
                                                    } catch (e) {
                                                        console.error("Failed to resolve", e);
                                                        alert("Failed to resolve ticket");
                                                    }
                                                }} className="flex items-center justify-center sm:w-32 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                                                    <CheckCircle className="w-3 h-3 mr-1.5" /> Resolve
                                                </button>
                                            )}
                                            <button onClick={() => navigate('/tickets')} className="flex items-center justify-center sm:w-32 px-3 py-1.5 bg-[#262832] text-slate-300 text-xs font-bold rounded-lg hover:bg-[#383a45] transition-colors border border-[#262832]">
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* 4. Today's Schedule & 5. Quick Update */}
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-[#181a20] rounded-2xl shadow-sm border border-[#262832] p-5">
                            <h3 className="font-bold text-slate-200 mb-4 flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                4. Today's Plan
                            </h3>
                            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                {activeTickets.length === 0 ? (
                                    <div className="relative flex items-center justify-center p-4">
                                        <p className="text-sm text-slate-500 bg-[#181a20] px-4 relative z-10 border border-[#262832] rounded-lg">No tasks planned for today.</p>
                                    </div>
                                ) : activeTickets.slice(0, 3).map((t: any, index: number) => (
                                    <div key={t.id} className={`relative flex items-center justify-between md:justify-normal group ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} ${t.status === 'IN_PROGRESS' ? 'is-active' : ''}`}>
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#262832] shadow shrink-0 z-10 md:order-1 ${index % 2 !== 0 ? 'md:-translate-x-1/2' : 'md:translate-x-1/2'} ${t.status === 'IN_PROGRESS' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>
                                            {t.status === 'IN_PROGRESS' ? <Activity className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        </div>
                                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#181a20] p-3 rounded border border-[#262832] shadow-sm ${index % 2 !== 0 ? 'ml-4 md:ml-0 md:mr-4' : 'ml-4'}`}>
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-white text-xs truncate">{t.title}</div>
                                                <time className={`text-[10px] font-medium ${t.status === 'IN_PROGRESS' ? 'text-emerald-500' : 'text-slate-500'}`}>{t.status === 'IN_PROGRESS' ? 'Now' : 'Pending'}</time>
                                            </div>
                                            <div className="text-slate-500 text-[10px] truncate">{t.resourceName || 'Assigned'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#181a20] rounded-2xl shadow-sm border border-[#262832] p-5 flex flex-col h-full">
                            <h3 className="font-bold text-slate-200 mb-4 flex items-center text-sm">
                                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                5. Quick Shortcuts
                            </h3>
                            <div className="space-y-4 flex-1">
                                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                    Manage your active tickets, update workflows, and post comments securely from the central Kanban board.
                                </p>
                                <button onClick={() => navigate('/tickets')} className="w-full px-3 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center hover:-translate-y-0.5">
                                    <Wrench className="w-4 h-4 mr-2" /> Open Ticketing Center
                                </button>
                                <button onClick={() => navigate('/resources')} className="w-full px-3 py-3 bg-[#262832] text-slate-300 text-sm font-bold rounded-xl hover:bg-[#383a45] transition-colors border border-[#262832] shadow-sm flex items-center justify-center hover:-translate-y-0.5">
                                    <Database className="w-4 h-4 mr-2" /> View Asset Database
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Area (Right 1/3) */}
                <div className="space-y-6">
                    {/* 6. Inventory Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-sm p-5 text-amber-900 relative">
                        <AlertCircle className="absolute top-4 right-4 w-6 h-6 text-amber-400 opacity-50" />
                        <h3 className="font-bold text-sm mb-3 flex items-center text-amber-800">
                            <Database className="w-4 h-4 mr-2" />
                            6. Inventory Alerts
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-medium bg-amber-100/50 p-2 rounded">
                                <span>HDMI Cables (2m)</span>
                                <span className="text-red-600 font-bold">2 left</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-medium bg-amber-100/50 p-2 rounded">
                                <span>Projector Bulbs</span>
                                <span className="text-amber-600 font-bold">1 left</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 text-xs font-bold text-center bg-[#181a20] border border-amber-200 py-1.5 rounded-lg hover:bg-amber-100 transition-colors text-amber-800 shadow-sm">Request Parts</button>
                    </div>

                    {/* 9. Comm Center */}
                    <div className="bg-[#181a20] border border-[#262832] rounded-2xl shadow-sm p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-sm flex items-center text-slate-200">
                                <Bell className="w-4 h-4 mr-2 text-indigo-500" />
                                9. Communications
                            </h3>
                            <Link to="/notifications" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600">View All</Link>
                        </div>
                        {notifications.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-4">No recent messages.</p>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notif: any) => (
                                    <div key={notif.id} className="p-3 bg-[#12141a] border border-[#383a45] rounded-xl relative">
                                        {!notif.read && <div className="absolute top-3 w-1.5 h-1.5 rounded-full bg-blue-500 -left-0.5"></div>}
                                        <p className="text-xs font-bold text-slate-200 mb-0.5">{notif.title}</p>
                                        <p className="text-[10px] text-slate-500">{notif.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 10. Tools & Resources */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-5 text-white">
                        <h3 className="font-bold text-sm mb-4 flex items-center text-slate-100">
                            <Settings className="w-4 h-4 mr-2" />
                            Ticket Distribution
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Open Pool</span>
                                    <span>{statsData.open}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(100, (statsData.open / 10) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>In Progress</span>
                                    <span>{statsData.inProgress}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (statsData.inProgress / 5) * 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <span>Resolved Today</span>
                                    <span>{statsData.resolved}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (statsData.resolved / 5) * 100)}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
