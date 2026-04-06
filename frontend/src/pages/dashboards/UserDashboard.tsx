import { CheckCircle, Clock, AlertCircle, ArrowUpRight, BarChart3, TrendingUp, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';

export default function UserDashboard() {
    const [stats, setStats] = useState({ activeBookings: 0, pendingBookings: 0, openTickets: 0, myTotal: 0 });
    const [bookings, setBookings] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Quick book state
    const [qbResource, setQbResource] = useState('');
    const [qbDate, setQbDate] = useState('');
    const [qbStart, setQbStart] = useState('');
    const [qbEnd, setQbEnd] = useState('');
    const [qbError, setQbError] = useState('');
    const [qbSuccess, setQbSuccess] = useState(false);
    const [qbLoading, setQbLoading] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [bookRes, tickRes, notifRes, resRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/tickets'),
                api.get('/notifications').catch(() => ({ data: [] })),
                api.get('/resources')
            ]);
            
            const myBookings = bookRes.data || [];
            const myTickets = tickRes.data || [];
            const myNotifs = notifRes.data || [];
            const myResources = resRes.data || [];

            setResources(myResources.filter((r: any) => r.status === 'ACTIVE'));
            if (myResources.length > 0 && !qbResource) {
                const activeRes = myResources.filter((r: any) => r.status === 'ACTIVE');
                if (activeRes.length > 0) setQbResource(activeRes[0].id);
            }

            setBookings(myBookings.slice(0, 5));
            setTickets(myTickets.slice(0, 5));
            setNotifications(myNotifs.slice(0, 3)); // Top 3 recent notifications

            setStats({
                activeBookings: myBookings.filter((b: any) => b.status === 'APPROVED').length,
                pendingBookings: myBookings.filter((b: any) => b.status === 'PENDING').length,
                openTickets: myTickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
                myTotal: myBookings.length
            });

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        
        // Initialize quick book default time
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setQbDate(`${year}-${month}-${day}`);
        const startH = String(d.getHours()).padStart(2, '0');
        const startM = String(d.getMinutes()).padStart(2, '0');
        setQbStart(`${startH}:${startM}`);
        d.setHours(d.getHours() + 1);
        const endH = String(d.getHours()).padStart(2, '0');
        const endM = String(d.getMinutes()).padStart(2, '0');
        setQbEnd(`${endH}:${endM}`);
    }, []);

    const handleQuickBook = async (e: React.FormEvent) => {
        e.preventDefault();
        setQbError('');
        setQbSuccess(false);
        if (!qbResource) return setQbError("Please select a resource.");
        if (qbStart >= qbEnd) return setQbError("End time must be after start time.");
        const today = new Date().toISOString().split('T')[0];
        if (qbDate < today) return setQbError("Booking date cannot be in the past.");
        
        try {
            setQbLoading(true);
            await api.post('/bookings', {
                resourceId: qbResource,
                date: qbDate,
                startTime: qbStart + ':00',
                endTime: qbEnd + ':00',
                purpose: 'Quick Booking from Dashboard',
                expectedAttendees: 2
            });
            setQbSuccess(true);
            fetchData();
            setTimeout(() => setQbSuccess(false), 5000);
        } catch (error: any) {
            const data = error.response?.data;
            if (data?.fieldErrors && data.fieldErrors.length > 0) {
                setQbError(data.fieldErrors[0].message);
            } else {
                setQbError(data?.message || 'Conflict detected. Resource might be taken.');
            }
        } finally {
            setQbLoading(false);
        }
    };

    const formatShortTime = (isoString?: string) => {
        if (!isoString) return '10:00 AM';
        try {
            return format(parseISO(isoString), 'h:mm a');
        } catch {
            return '10:00 AM';
        }
    };

    const formatDateDisplay = (isoString?: string) => {
        if (!isoString) return 'Mar 24';
        try {
            return format(parseISO(isoString), 'MMM dd');
        } catch {
            return 'Mar 24';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 opacity-50 h-[80vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Syncing Profile Data...</span>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-slate-300 font-sans">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-[32px] font-extrabold text-white tracking-tight leading-none mb-2">Welcome back, User</h1>
                    <p className="text-sm font-medium text-slate-500">Here's your campus overview for today</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/resources?action=book" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black tracking-wide border border-blue-500/50 flex items-center shadow-lg shadow-blue-600/20 transition-all">
                        <CalendarIcon className="w-4 h-4 mr-2" /> Book Facility
                    </Link>
                    <Link to="/tickets" className="px-5 py-2.5 bg-[#181a20] hover:bg-[#21242d] text-slate-300 rounded-lg text-xs font-black tracking-wide border border-[#262832] flex items-center transition-all">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-400" /> Report Issue
                    </Link>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Stat 1 */}
                <Link to="/bookings" className="block bg-[#181a20] rounded-xl p-6 border border-[#262832] relative overflow-hidden group hover:border-[#383a45] transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="flex items-center text-emerald-500 text-[11px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                            <TrendingUp className="w-3 h-3 mr-1" /> +2
                        </span>
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Active Bookings</h3>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.activeBookings}</p>
                </Link>

                {/* Stat 2 */}
                <Link to="/bookings" className="block bg-[#181a20] rounded-xl p-6 border border-[#262832] relative overflow-hidden group hover:border-[#383a45] transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock className="w-16 h-16 text-amber-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Pending Approvals</h3>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.pendingBookings}</p>
                </Link>

                {/* Stat 3 */}
                <Link to="/tickets" className="block bg-[#181a20] rounded-xl p-6 border border-[#262832] relative overflow-hidden group hover:border-[#383a45] transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Open Tickets</h3>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.openTickets}</p>
                </Link>

                {/* Stat 4 */}
                <Link to="/analytics" className="block bg-[#181a20] rounded-xl p-6 border border-[#262832] relative overflow-hidden group hover:border-[#383a45] transition-colors cursor-pointer">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="w-16 h-16 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="flex items-center text-blue-400 text-[11px] font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> All Time
                        </span>
                    </div>
                    <h3 className="text-[12px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Total Interactions</h3>
                    <p className="text-3xl font-black text-white tracking-tight">{stats.myTotal}</p>
                </Link>
            </div>

            {/* Split Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Bookings & Activity) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Quick Book Component */}
                    <div className="bg-[#181a20] rounded-2xl border border-slate-200 dark:border-[#262832] p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                Quick Book a Resource
                            </h2>
                            <Link to="/resources" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-500 transition-colors bg-slate-100 dark:bg-[#12141a] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#262832]">View Catalog</Link>
                        </div>
                        
                        {qbSuccess ? (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-6 text-center">
                                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3 shadow-sm rounded-full" />
                                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Successfully Booked!</h3>
                                <p className="text-xs text-slate-600 dark:text-emerald-500 font-medium">Your request has been officially recorded and pending approval.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleQuickBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {qbError && (
                                    <div className="col-span-1 md:col-span-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                        {qbError}
                                    </div>
                                )}
                                
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Select Facility or Asset</label>
                                    <select required value={qbResource} onChange={e => setQbResource(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-slate-200 dark:border-[#262832] rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500/50 appearance-none font-medium">
                                        <option value="" disabled>-- Choose an available resource --</option>
                                        {resources.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
                                    <input required type="date" min={new Date().toISOString().split('T')[0]} value={qbDate} onChange={e => setQbDate(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-slate-200 dark:border-[#262832] text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-medium text-xs [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Start Time</label>
                                    <input required type="time" value={qbStart} onChange={e => setQbStart(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-slate-200 dark:border-[#262832] text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-medium text-xs [color-scheme:dark]" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">End Time</label>
                                    <input required type="time" value={qbEnd} onChange={e => setQbEnd(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-slate-200 dark:border-[#262832] text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none font-medium text-xs [color-scheme:dark]" />
                                </div>

                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <button disabled={qbLoading} type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-[0_4px_10px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center disabled:opacity-70">
                                        {qbLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Confirm Quick Book"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* My Bookings Table */}
                    <div className="bg-[#181a20] rounded-2xl border border-[#262832] overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#262832] flex justify-between items-center bg-[#12141a]/40">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                Upcoming Bookings
                            </h2>
                            <Link to="/bookings" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">Show All</Link>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="p-10 text-center opacity-30 text-xs tracking-widest font-black uppercase">No Bookings Found</div>
                        ) : (
                            <div className="divide-y divide-[#262832]/50">
                                {bookings.map((booking, i) => (
                                    <div key={booking.id || i} className="p-4 px-6 flex items-center justify-between hover:bg-[#262832]/20 transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#12141a] border border-[#262832] flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">{formatDateDisplay(booking.startTime).split(' ')[0]}</span>
                                                <span className="text-sm font-black text-white leading-none">{formatDateDisplay(booking.startTime).split(' ')[1]}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-[13px] font-bold text-slate-200 mb-0.5 group-hover:text-blue-400 transition-colors">{booking.resource?.name || 'Resource'}</h4>
                                                <p className="text-[11px] font-medium text-slate-500">{formatShortTime(booking.startTime)} - {formatShortTime(booking.endTime)} • {booking.purpose}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${booking.status === 'APPROVED' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Tickets & Activity) */}
                <div className="space-y-8">
                    
                    {/* Open Tickets Action Focus */}
                    <div className="bg-gradient-to-br from-[#181a20] to-[#12141a] rounded-2xl border border-[#262832] p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center">
                                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                Needs Attention
                            </h2>
                            <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20">{stats.openTickets}</span>
                        </div>

                        {tickets.length === 0 ? (
                            <div className="p-10 text-center opacity-30 text-xs tracking-widest font-black uppercase">No Active Tickets</div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {tickets.map((ticket, i) => (
                                    <div key={ticket.id || i} className="bg-[#1c1e26] p-4 rounded-xl border border-[#2b2d38] hover:border-red-500/30 transition-colors cursor-pointer group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded">
                                                {ticket.priority || 'HIGH'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">#{ticket.id ? ticket.id.substring(0,6).toUpperCase() : 'TK01'}</span>
                                        </div>
                                        <h4 className="text-[12px] font-bold text-slate-200 mb-1 leading-snug">{ticket.title}</h4>
                                        <div className="text-[10px] text-slate-500 font-medium">{ticket.status}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link to="/tickets" className="mt-4 w-full block text-center py-3 rounded-xl bg-[#262832]/50 hover:bg-[#262832] text-[11px] font-bold text-slate-300 uppercase tracking-widest transition-colors border border-[#2b2d38]">
                            View All Tickets
                        </Link>
                    </div>

                    {/* Simple Timeline / Recent Activity */}
                    <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Recent Activity</h2>
                            <Link to="/notifications" className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors">Show All</Link>
                        </div>
                        
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center opacity-30 text-xs tracking-widest font-black uppercase">No Recent Activity</div>
                        ) : (
                            <div className="relative border-l-2 border-[#262832] ml-3 pb-4 space-y-8">
                                {notifications.map((notif: any) => {
                                    const isTicket = notif.referenceType === 'TICKET';
                                    const colorClass = isTicket ? 'bg-emerald-500' : 'bg-blue-500';
                                    const textColor = isTicket ? 'text-emerald-500' : 'text-blue-400';
                                    
                                    return (
                                        <div key={notif.id} className="relative">
                                            <div className={`absolute w-3 h-3 ${colorClass} rounded-full -left-[7.5px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-[#181a20]`}></div>
                                            <div className="pl-6">
                                                <p className={`text-[10px] font-bold ${textColor} mb-1 uppercase tracking-wider`}>
                                                    {formatDateDisplay(notif.createdAt)} • {formatShortTime(notif.createdAt)}
                                                </p>
                                                <p className="text-[12px] font-bold text-slate-200">{notif.title}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{notif.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
