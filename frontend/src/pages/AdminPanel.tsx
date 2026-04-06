import { Hourglass, Users, Wrench, Check, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { format, parseISO } from 'date-fns';

export default function AdminPanel() {
    const [stats, setStats] = useState({ usersCount: 0, pendingBookingsCount: 0, highPriorityCount: 0, techniciansCount: 0 });
    const [pendingBookings, setPendingBookings] = useState<any[]>([]);
    const [unassignedTickets, setUnassignedTickets] = useState<any[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ticketAssignments, setTicketAssignments] = useState<Record<string, string>>({});

    const fetchAdminData = async () => {
        try {
            setIsLoading(true);
            const [usersRes, ticketsRes, bookingsRes] = await Promise.all([
                api.get('/users'),
                api.get('/tickets'),
                api.get('/bookings')
            ]);
            
            const users = usersRes.data || [];
            const tickets = ticketsRes.data || [];
            const bookings = bookingsRes.data || [];

            // Compute Stats
            // Compute Stats - Backend sends Role enum as string "TECHNICIAN"
            const techs = users.filter((u: any) => u.role === 'TECHNICIAN' || u.role?.name === 'TECHNICIAN');
            setTechnicians(techs);

            const pending = bookings.filter((b: any) => b.status === 'PENDING');
            setPendingBookings(pending.slice(0, 5)); // Just show recent 5

            const highTickets = tickets.filter((t: any) => t.priority === 'HIGH' || t.priority === 'CRITICAL');
            const unassigned = tickets.filter((t: any) => t.status === 'OPEN' && !t.assignee);
            setUnassignedTickets(unassigned.slice(0, 5));

            setStats({
                usersCount: users.length,
                techniciansCount: techs.length,
                pendingBookingsCount: pending.length,
                highPriorityCount: highTickets.length
            });

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleApproveBooking = async (id: string, approved: boolean) => {
        try {
            await api.patch(`/bookings/${id}/review`, {
                decision: approved ? 'APPROVED' : 'REJECTED',
                adminNotes: approved ? 'Approved by Admin' : 'Rejected by Admin'
            });
            fetchAdminData(); // Refresh list
        } catch (e) {
            console.error("Failed to review booking", e);
            alert("Error reviewing booking");
        }
    };

    const handleAssignTicket = async (ticketId: string) => {
        const assigneeId = ticketAssignments[ticketId];
        if (!assigneeId) {
            alert("Please select a technician first");
            return;
        }
        try {
            await api.patch(`/tickets/${ticketId}/status`, {
                status: 'IN_PROGRESS',
                assigneeId: assigneeId
            });
            fetchAdminData();
        } catch (e) {
            console.error(e);
            alert("Failed to assign ticket");
        }
    };

    const formatDateTime = (start: string, end: string) => {
        try {
            const startDate = parseISO(start);
            const endDate = parseISO(end);
            return `${format(startDate, 'dd MMM')} · ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full font-sans pb-10 text-slate-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Admin Panel</h1>
                    <p className="text-[12px] text-slate-500 mt-1">Manage bookings, tickets, users</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 opacity-50 h-[60vh]">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Initializing Core Systems...</span>
                </div>
            ) : (
                <>
                    {/* Top Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Card 1 */}
                        <div className="bg-[#181a20] border-t-[3px] border-t-blue-500 border border-[#262832] border-t-solid rounded-xl p-5 shadow-sm">
                            <div className="mb-4 text-amber-500">
                                <Hourglass className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black text-white mb-1 tracking-tight">{stats.pendingBookingsCount}</div>
                            <div className="text-[11px] font-semibold text-slate-500 mb-2">Pending Approvals</div>
                            <div className="text-[10px] font-bold text-red-500 flex items-center">
                                Needs review
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#181a20] border-t-[3px] border-t-red-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                            <div className="mb-4 text-red-500">
                                <span className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] block"></span>
                            </div>
                            <div className="text-2xl font-black text-white mb-1 tracking-tight">{stats.highPriorityCount}</div>
                            <div className="text-[11px] font-semibold text-slate-500 mb-2">High Priority Tickets</div>
                            <div className="text-[10px] font-bold text-red-500 flex items-center">
                                Urgent
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#181a20] border-t-[3px] border-t-emerald-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                            <div className="mb-4 text-slate-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black text-white mb-1 tracking-tight">{stats.usersCount}</div>
                            <div className="text-[11px] font-semibold text-slate-500 mb-2">Total Users</div>
                            <div className="text-[10px] font-bold text-emerald-500 flex items-center">
                                <span className="mr-1">▲</span> 12 this week {/* Simulated relative stat */}
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-[#181a20] border-t-[3px] border-t-amber-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                            <div className="mb-4 text-amber-500">
                                <Wrench className="w-5 h-5" />
                            </div>
                            <div className="text-2xl font-black text-white mb-1 tracking-tight">{stats.techniciansCount}</div>
                            <div className="text-[11px] font-semibold text-slate-500 mb-2">Active Technicians</div>
                            <div className="text-[10px] font-bold text-emerald-500 flex items-center">
                                All healthy
                            </div>
                        </div>
                    </div>

                    {/* Split Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Panel: Pending Booking Requests */}
                        <div className="lg:col-span-2 bg-[#181a20] border border-[#262832] rounded-xl p-6 flex flex-col min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] font-black tracking-widest text-white">Pending Booking Requests</h3>
                                <div className="flex items-center space-x-3">
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                        {stats.pendingBookingsCount} pending
                                    </span>
                                    <Link to="/bookings" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest">
                                        Go to Bookings Dashboard →
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-4 flex-1">
                                {pendingBookings.length === 0 ? (
                                    <div className="flex items-center justify-center p-10 opacity-30 text-xs tracking-widest font-black uppercase">
                                        No Pending Bookings
                                    </div>
                                ) : (
                                    pendingBookings.map((b, i) => (
                                        <div key={b.id || i} className="pb-5 border-b border-[#262832]/80 last:border-0 relative">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-[13px] font-bold text-slate-200">
                                                    {(b.resource?.name || 'Resource')} · {formatDateTime(b.startTime, b.endTime)}
                                                </h4>
                                                <span className="text-[10px] font-bold text-amber-500 border border-amber-500/30 px-3 py-0.5 rounded-full absolute right-0 top-0">
                                                    Pending
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mb-3 font-medium">
                                                {(b.user?.name || 'User')} • {b.purpose}
                                            </p>
                                            
                                            <div className="flex space-x-3">
                                                <button 
                                                    onClick={() => handleApproveBooking(b.id, true)}
                                                    className="flex items-center text-[10px] font-bold text-emerald-500 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <Check className="w-3 h-3 mr-1.5" strokeWidth={3} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleApproveBooking(b.id, false)}
                                                    className="flex items-center text-[10px] font-bold text-red-500 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                >
                                                    <X className="w-3 h-3 mr-1.5" strokeWidth={3} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Panel: Assign Technicians */}
                        <div className="lg:col-span-1 bg-[#181a20] border border-[#262832] rounded-xl p-6 flex flex-col min-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[12px] font-black tracking-widest text-white">Assign Technicians</h3>
                                <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                                    {unassignedTickets.length} unassigned
                                </span>
                            </div>

                            <div className="flex flex-col space-y-5 flex-1 overflow-y-auto">
                                {unassignedTickets.length === 0 ? (
                                    <div className="flex items-center justify-center p-10 opacity-30 text-xs tracking-widest font-black uppercase">
                                        All Tickets Assigned
                                    </div>
                                ) : (
                                    unassignedTickets.map((t, i) => {
                                        const isHigh = t.priority === 'HIGH' || t.priority === 'CRITICAL';
                                        const dotColor = isHigh ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                                                        t.priority === 'MEDIUM' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 
                                                        'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';

                                        return (
                                            <div key={t.id || i} className="pb-5 border-b border-[#262832]/80 last:border-0 text-white">
                                                <h4 className="text-[12px] font-bold mb-1 line-clamp-1">#{(t.id || 'N').substring(0,8).toUpperCase()} - {t.title}</h4>
                                                <div className="flex items-center text-[10px] font-bold text-slate-500 mb-3">
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span> {t.priority.replace('_', '')}
                                                </div>
                                                
                                                <div className="flex space-x-2 w-full">
                                                    <div className="flex-1 relative">
                                                        <select 
                                                            value={ticketAssignments[t.id] || ''}
                                                            onChange={(e) => setTicketAssignments({...ticketAssignments, [t.id]: e.target.value})}
                                                            className="w-full bg-[#12141a] border border-[#262832] text-slate-300 text-[11px] font-medium py-2 pl-3 pr-3 rounded-lg focus:outline-none focus:border-blue-500/50 hover:border-[#2b2e3b] transition-colors cursor-pointer"
                                                        >
                                                            <option value="" disabled>Assign...</option>
                                                            {technicians.map(tech => (
                                                                <option key={tech.id} value={tech.id}>{tech.name || tech.email}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAssignTicket(t.id)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white text-[11px] px-4 py-2 font-bold rounded-lg transition-colors"
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
