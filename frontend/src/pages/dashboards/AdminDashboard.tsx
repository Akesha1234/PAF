import { Calendar, Ticket, Zap, Building, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';

export default function AdminDashboard() {
    const userName = localStorage.getItem('userName') || 'Admin';
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState([
        { icon: Building, value: '0', label: 'Total Resources', trend: 'Updating...', trendColor: 'text-slate-500', link: '/admin/assets' },
        { icon: Calendar, value: '0', label: 'Active Bookings', trend: 'Updating...', trendColor: 'text-slate-500', link: '/bookings' },
        { icon: Ticket, value: '0', label: 'Open Tickets', trend: 'Updating...', trendColor: 'text-slate-500', link: '/admin/tickets' },
        { icon: Zap, value: '100%', label: 'Uptime SLA', trend: 'Target met', trendColor: 'text-emerald-500', link: '/analytics' },
    ]);

    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [recentTickets, setRecentTickets] = useState<any[]>([]);

    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            const [resRes, bookRes, tickRes] = await Promise.all([
                api.get('/resources'),
                api.get('/bookings'),
                api.get('/tickets')
            ]);

            const resources = resRes.data || [];
            const bookings = bookRes.data || [];
            const tickets = tickRes.data || [];

            const activeBookings = bookings.filter((b: any) => b.status === 'APPROVED' || b.status === 'CHECKED_IN');
            const openTickets = tickets.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

            setStats([
                { icon: Building, value: resources.length.toString(), label: 'Total Resources', trend: 'Total managed', trendColor: 'text-blue-400', link: '/admin/assets' },
                { icon: Calendar, value: activeBookings.length.toString(), label: 'Active Bookings', trend: `+${bookings.filter((b:any)=>b.status==='PENDING').length} pending`, trendColor: 'text-amber-500', link: '/bookings' },
                { icon: Ticket, value: openTickets.length.toString(), label: 'Open Tickets', trend: `${tickets.filter((t:any)=>t.priority==='CRITICAL').length} critical`, trendColor: 'text-red-500', link: '/admin/tickets' },
                { icon: Zap, value: '98%', label: 'System Health', trend: 'Optimal', trendColor: 'text-emerald-500', link: '/analytics' },
            ]);

            setRecentBookings(bookings.slice(0, 3));
            setRecentTickets(tickets.filter((t: any) => t.status === 'OPEN').slice(0, 2));

        } catch (error) {
            console.error("Dashboard fetch error", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatTime = (iso: string) => {
        try {
            return format(parseISO(iso), 'HH:mm');
        } catch {
            return '12:00';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                <div>
                    <h1 className="text-[28px] font-extrabold text-slate-100 flex items-center gap-2 tracking-tight">
                        Hello, {userName} <span className="text-2xl">👋</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Operational Hub Overview</p>
                </div>
                <div className="text-right hidden md:block">
                     <p className="text-slate-500 text-xs font-bold tracking-wide">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 opacity-50 h-[60vh]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Syncing Intelligence...</span>
                </div>
            ) : (
                <>
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, i) => (
                            <Link to={stat.link} key={i} className="block bg-[#181a20] rounded-2xl border border-[#262832] p-6 hover:border-[#3a3d4a] transition-all flex flex-col group shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-blue-500/10 transition-colors">
                                        <stat.icon className={`w-5 h-5 ${i===0?'text-blue-400':i===1?'text-amber-500':i===2?'text-red-500':'text-emerald-500'}`} />
                                    </div>
                                </div>
                                <h3 className="text-[32px] font-black text-slate-100 leading-tight mb-0.5">{stat.value}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-4">{stat.label}</p>
                                <div className={`text-[9px] font-black ${stat.trendColor} uppercase tracking-wider mt-auto`}>
                                    {stat.trend}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Middle Section: Booking Activity & Timeline */}
                    <div className="grid lg:grid-cols-3 gap-6 relative">
                        <div className="lg:col-span-2 bg-[#181a20] rounded-2xl border border-[#262832] p-8 shadow-sm flex flex-col h-full">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Resource Utilization</h3>
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span> Network Active
                                </span>
                            </div>

                            {/* Chart Area */}
                            <div className="flex-1 flex flex-col justify-end min-h-[160px] pb-6 border-b border-[#262832] gap-1 px-4">
                                <div className="flex items-end justify-between h-[120px] w-full gap-1.5">
                                    {[40, 60, 80, 50, 45, 100, 40, 45, 50, 80, 50, 80, 95, 60, 70, 40].map((h, i) => (
                                        <div key={i} className={`w-full rounded-t-sm ${i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-slate-700'} opacity-90 transition-all cursor-pointer`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 space-y-5">
                                {[
                                    { label: 'Lecture Halls', value: '78%', color: 'bg-blue-500' },
                                    { label: 'Laboratories', value: '62%', color: 'bg-emerald-500' },
                                    { label: 'Meeting Rooms', value: '45%', color: 'bg-amber-500' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                            <span>{item.label}</span>
                                            <span className={item.color.replace('bg-', 'text-')}>{item.value}</span>
                                        </div>
                                        <div className="w-full h-1 bg-[#12141a] rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Alerts */}
                        <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">System Alerts</h3>
                                <Link to="/admin/tickets" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">View All</Link>
                            </div>
                            <div className="relative pl-5 border-l border-[#262832] space-y-8 mt-6">
                                {recentTickets.length > 0 ? recentTickets.map((t, i) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[27px] w-2.5 h-2.5 rounded-full border-2 ${t.priority==='CRITICAL'?'border-red-500':'border-amber-500'} bg-[#181a20]`}></div>
                                        <h4 className="text-[12px] font-black text-slate-200 mb-1 leading-tight uppercase tracking-tight">{t.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t.priority} · {t.id.substring(0,8).toUpperCase()}</p>
                                    </div>
                                )) : (
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest py-4">No Critical Alerts</div>
                                )}
                                <div className="relative opacity-50">
                                    <div className="absolute -left-[27px] w-2.5 h-2.5 rounded-full border-2 border-slate-700 bg-[#181a20]"></div>
                                    <h4 className="text-[12px] font-black text-slate-400 mb-1 leading-tight uppercase tracking-tight">System Backup Completed</h4>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Yesterday · 04:00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Live Bookings Table */}
                        <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-6 shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Live Reservations</h3>
                                <Link to="/bookings" className="text-[10px] font-black text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest hover:bg-blue-500/10 transition-all">Approvals</Link>
                            </div>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] border-b border-[#262832]">
                                        <th className="pb-4 pl-2">Resource</th>
                                        <th className="pb-4">User</th>
                                        <th className="pb-4 text-right pr-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[12px] font-bold text-slate-300 divide-y divide-[#262832]/50">
                                    {recentBookings.length > 0 ? recentBookings.map((b, i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="py-4 pl-2">
                                                <div className="font-black text-white uppercase tracking-tight">{b.resourceName || 'Unknown'}</div>
                                                <div className="text-[10px] text-slate-500 font-medium">{formatTime(b.startTime)} - {formatTime(b.endTime)}</div>
                                            </td>
                                            <td className="py-4 text-slate-400">User {b.userId?.substring(0,8).toUpperCase()}</td>
                                            <td className="py-4 text-right pr-2">
                                                <span className={`text-[9px] uppercase tracking-widest font-black border px-2.5 py-1 rounded-lg ${b.status==='APPROVED'?'border-blue-500/30 text-blue-400 bg-blue-500/10':b.status==='PENDING'?'border-amber-500/30 text-amber-500 bg-amber-500/10':'border-slate-500/30 text-slate-500'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="py-8 text-center text-slate-600 uppercase tracking-widest text-[10px]">No recent data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Quick Actions / Integration */}
                        <div className="bg-gradient-to-br from-[#1e2330] to-[#181a20] rounded-2xl border border-[#2b3140] p-8 shadow-xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                           <Zap className="w-12 h-12 text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-500" />
                           <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Operational Excellence</h3>
                           <p className="text-slate-400 text-sm font-medium mb-8 max-w-sm">Manage entire campus facilities, incident reports and user authentication from a unified command center.</p>
                           <div className="flex gap-4">
                                <Link to="/admin/assets" className="px-6 py-2.5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all">Manage Assets</Link>
                                <Link to="/admin/users" className="px-6 py-2.5 bg-[#12141a] border border-[#262832] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:border-slate-600 transition-all">User Access</Link>
                           </div>
                        </div>
                    </div>

                    {/* NEW: Facilities & Resources Summary Section (The "White" fix requested) */}
                    <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-[14px] font-black text-white uppercase tracking-[0.2em]">Facilities & Campus Resources</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Infrastructure Status</p>
                            </div>
                            <Link to="/admin/assets" className="text-[10px] font-black text-blue-500 border-b border-blue-500/20 hover:border-blue-500 pb-1 uppercase tracking-widest transition-all">View All Infrastructure</Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'Lecture Halls', active: '12 / 14', status: 'Optimal', color: 'text-emerald-500' },
                                { title: 'IT Laboratories', active: '8 / 8', status: 'Full System', color: 'text-emerald-500' },
                                { title: 'Meeting Rooms', active: '15 / 18', status: 'Maintenance (3)', color: 'text-amber-500' }
                            ].map((facility, i) => (
                                <div key={i} className="bg-[#12141a] border border-[#262832] rounded-xl p-5 hover:border-[#3a3d4a] transition-all">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{facility.title}</h4>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-black text-white">{facility.active}</p>
                                            <p className={`text-[10px] font-bold ${facility.color} mt-1 uppercase tracking-wider`}>{facility.status}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                                            <div className={`w-2.5 h-2.5 rounded-full ${facility.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#262832] flex flex-wrap gap-4">
                            {['HVAC Systems', 'Network Hubs', 'Surveillance', 'Access Control', 'Main Power Grid'].map(sys => (
                                <div key={sys} className="flex items-center gap-2 px-4 py-2 bg-[#12141a] rounded-lg border border-[#262832]">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sys}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

