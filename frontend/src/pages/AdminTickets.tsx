import { useState, useEffect } from 'react';
import { Search, Wrench, Paperclip, History, Loader2, Filter, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import type { TicketResponse } from '../types';

export default function AdminTickets() {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [technicians, setTechnicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const res = await api.get('/users');
            setTechnicians(res.data.filter((u: any) => u.role === 'TECHNICIAN'));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchTickets();
        fetchTechnicians();
    }, []);

    const handleAssign = async (id: string, technicianId: string) => {
        try {
            await api.patch(`/tickets/${id}/status`, {
                status: 'IN_PROGRESS',
                assigneeId: technicianId
            });
            fetchTickets();
        } catch (e) {
            console.error(e);
            alert('Failed to assign ticket');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-white tracking-tight leading-tight">Maintenance Dispatch</h1>
                    <p className="text-[12px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Manage and Assign Campus Incidents</p>
                </div>
                <div className="flex items-center gap-3">
                     <button className="flex items-center px-4 py-2 bg-[#181a20] border border-[#262832] text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:text-white transition-all">
                        <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all">
                        <History className="w-3.5 h-3.5 mr-2" /> History
                    </button>
                </div>
            </div>

            <div className="bg-[#181a20] rounded-2xl border border-[#262832] shadow-2xl relative min-h-[500px] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-[#262832] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141a]/30">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-wider">Active Service Requests</h3>
                    <div className="relative md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find tickets by title, ID or asset..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 opacity-50 h-full">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Retrieving Tickets...</span>
                        </div>
                    ) : tickets.length === 0 ? (
                         <div className="flex flex-col items-center justify-center p-20 opacity-30 h-full">
                            <Wrench className="w-12 h-12 text-slate-500 mb-4" />
                            <span className="text-sm font-bold tracking-widest text-slate-400">All Systems Clear</span>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-[#12141a]/50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-[#262832]">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Issue Description</th>
                                    <th className="px-6 py-4">Vitals</th>
                                    <th className="px-6 py-4">Assets</th>
                                    <th className="px-6 py-4 text-right">Dispatch & Staff</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#262832]/80 font-sans">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-[#12141a]/30 transition-all group">
                                        <td className="px-6 py-5 font-mono text-[10px] text-slate-600">
                                            {(ticket.id as string).substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-2 h-10 rounded-full shrink-0 ${
                                                    ticket.priority === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                    ticket.priority === 'HIGH' ? 'bg-orange-500' :
                                                    ticket.priority === 'MEDIUM' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                                }`}></div>
                                                <div>
                                                    <div className="text-[14px] font-black text-white group-hover:text-blue-400 transition-colors uppercase decoration-blue-500/0 group-hover:decoration-blue-500/30 underline-offset-4 decoration-2">{ticket.title}</div>
                                                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 line-clamp-1">
                                                        {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 && <Paperclip className="w-3 h-3 text-blue-500" />}
                                                        {ticket.description || "No additional description provided."}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${
                                                    ticket.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    ticket.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {ticket.priority}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-300">{ticket.resourceName || 'Global Area'}</span>
                                                <span className="text-[9px] text-slate-600 font-mono mt-0.5 uppercase tracking-tighter">{ticket.resourceId ? `REF-${ticket.resourceId.substring(0, 6)}` : 'GEN-01'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {ticket.assigneeName ? (
                                                    <div className="p-1 px-3 bg-[#12141a] border border-[#262832] rounded-xl flex items-center group/staff relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-blue-500/5 translate-x-[-100%] group-hover/staff:translate-x-0 transition-transform duration-500"></div>
                                                        <div className="w-6 h-6 rounded-full bg-blue-900/40 flex items-center justify-center text-[10px] font-black text-blue-400 mr-2 border border-blue-500/30">
                                                            {ticket.assigneeName.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="text-left relative z-10">
                                                            <div className="text-[10px] font-black text-white leading-none">{ticket.assigneeName}</div>
                                                            <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Assigned</div>
                                                        </div>
                                                        
                                                        {ticket.status !== 'RESOLVED' && (
                                                            <div className="ml-3 pl-3 border-l border-[#262832]">
                                                                <select
                                                                    onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                                                    className="bg-transparent text-[10px] font-black text-amber-500 outline-none cursor-pointer tracking-widest uppercase"
                                                                    defaultValue=""
                                                                >
                                                                    <option value="" disabled>Reassign</option>
                                                                    {technicians.map(t => (
                                                                        <option key={t.id} value={t.id} className="bg-[#181a20] text-white font-sans">{t.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="relative group/assign">
                                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover/assign:opacity-40 transition duration-500"></div>
                                                        <div className="relative flex items-center bg-[#181a20] border border-blue-500/30 rounded-xl px-3 py-1.5">
                                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mr-2 animate-pulse" />
                                                            <select
                                                                onChange={(e) => handleAssign(ticket.id, e.target.value)}
                                                                className="bg-transparent text-[10px] font-black text-white hover:text-blue-400 outline-none cursor-pointer tracking-widest uppercase transition-colors"
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Dispatch Tech</option>
                                                                {technicians.map(t => (
                                                                    <option key={t.id} value={t.id} className="bg-[#181a20] text-white font-sans">{t.name}</option>
                                                                ))}
                                                            </select>
                                                            <ChevronRight className="w-3 h-3 text-slate-600 ml-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 px-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> 2 Critical</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> 5 High Priority</span>
                </div>
                <div>System Last Checked: {new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
}
