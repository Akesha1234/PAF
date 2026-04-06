import { MoreHorizontal, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

type KanbanTicket = {
    id: string;
    title: string;
    priority: string;
    status: string;
    assigneeName?: string;
    assignee?: { fullName?: string };
};

export default function KanbanBoard() {
    const [tickets, setTickets] = useState<KanbanTicket[]>([]);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/tickets');
            setTickets(res.data);
        } catch (error) {
            console.error("Failed to fetch tickets for Kanban", error);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const getColumnTickets = (status: string) => tickets.filter(t => t.status === status);

    const openTickets = getColumnTickets('OPEN');
    const inProgressTickets = getColumnTickets('IN_PROGRESS');
    const resolvedTickets = getColumnTickets('RESOLVED');
    const closedTickets = getColumnTickets('CLOSED');

    const renderCard = (ticket: KanbanTicket) => {
        const displayId = ticket.id ? ticket.id.substring(0, 8).toUpperCase() : 'UNKNOWN';
        const priorityColor = 
            ticket.priority === 'HIGH' || ticket.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
            ticket.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500';
            
        const assignee = ticket.assignee?.fullName || ticket.assigneeName || 'Unassigned';
        const assigneeInitials = assignee !== 'Unassigned' ? assignee.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : '?';

        return (
            <div key={ticket.id} className="bg-[#181a20] border border-[#262832] rounded-xl p-4 shadow-sm hover:border-[#383a45] transition-colors cursor-grab group">
                <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${priorityColor}`}>
                        {ticket.priority}
                    </span>
                    <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
                <h4 className="text-[13px] font-bold text-slate-200 mb-4 leading-snug">
                    {ticket.title}
                </h4>
                <div className="flex justify-between items-center mt-auto border-t border-[#262832]/50 pt-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[8px] font-black">
                            {assigneeInitials}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">#{displayId}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10 text-slate-300 min-h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Board</h1>
                    <p className="text-[12px] text-slate-500 mt-1">Ticket workflow management</p>
                </div>
                <button className="px-5 py-2.5 mt-4 sm:mt-0 bg-blue-500 hover:bg-blue-600 border border-blue-400/50 text-white font-black text-xs rounded-lg transition-colors tracking-wide flex items-center shadow-lg shadow-blue-500/20">
                    <Plus className="w-4 h-4 mr-2" /> New Feature
                </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Column 1: Open */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span> Open
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-[#12141a] px-2 py-0.5 rounded border border-[#262832]">{openTickets.length}</span>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1">
                        {openTickets.map(renderCard)}
                    </div>
                </div>

                {/* Column 2: In Progress */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> In Progress
                        </h3>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{inProgressTickets.length}</span>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1">
                        {inProgressTickets.map(renderCard)}
                    </div>
                </div>

                {/* Column 3: Resolved */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Resolved
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{resolvedTickets.length}</span>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1">
                        {resolvedTickets.map(renderCard)}
                    </div>
                </div>

                {/* Column 4: Closed */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-slate-600 mr-2"></span> Closed
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-[#12141a] px-2 py-0.5 rounded border border-[#262832]">{closedTickets.length}</span>
                    </div>
                    <div className="flex flex-col space-y-4 flex-1 opacity-60">
                        {closedTickets.map(renderCard)}
                    </div>
                </div>

            </div>
        </div>
    );
}
