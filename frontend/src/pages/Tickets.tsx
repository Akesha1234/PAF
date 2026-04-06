import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { X, Wrench, Loader2, Paperclip, Search, AlertCircle, CheckCircle2, Clock, ChevronRight, Trash2 } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

type Ticket = {
    id: string; // The backend returns UUIDs now. We can truncate them for display
    title: string;
    description: string;
    priority: string;
    category: string;
    location: string;
    status: string;
    createdAt: string;
    attachmentUrls?: string[];
};

export default function Tickets() {
    const [activeTab, setActiveTab] = useState('All');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const role = localStorage.getItem('userRole');
    
    // Resolve/Reject Actions State
    const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [resources, setResources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createError, setCreateError] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    
    // UI Enhancements
    // URL Integration for deep linking from resources
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const prefilledResourceId = queryParams.get('resourceId');

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

    // Form fields
    const [selectedResource, setSelectedResource] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('HIGH');
    const [category, setCategory] = useState('ELECTRICAL');
    const [files, setFiles] = useState<File[]>([]);
    
    // Comments State
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const fetchTickets = async () => {
        try {
            setIsLoading(true);
            
            // Fetch tickets - if this fails, we still want resources
            try {
                const tickRes = await api.get('/tickets');
                setTickets(tickRes.data || []);
            } catch (e) {
                console.error("Failed to fetch tickets", e);
            }

            // Fetch resources - critical for the form
            try {
                const resRes = await api.get('/resources');
                const resData = resRes.data || [];
                setResources(resData);
                
                // If we came with a resourceId in URL, open modal automatically
                if (prefilledResourceId && resData.some((r: any) => r.id === prefilledResourceId)) {
                    setSelectedResource(prefilledResourceId);
                    setIsReportModalOpen(true);
                } else if (resData.length > 0 && !selectedResource) {
                    // Auto-select first resource to enable "Submit" immediately
                    setSelectedResource(resData[0].id);
                }
            } catch (e) {
                console.error("Failed to fetch resources", e);
                setCreateError("Could not load campus facilities. Using offline list.");
            }
        } catch (error) {
            console.error("Unexpected error in fetch", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if(expandedTicketId) {
            fetchComments(expandedTicketId);
        } else {
            setComments([]);
            setNewComment('');
        }
    }, [expandedTicketId]);

    const fetchComments = async (ticketId: string) => {
        try {
            const res = await api.get(`/tickets/${ticketId}/comments`);
            setComments(res.data);
        } catch(e) {
            console.error(e);
        }
    };

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        const notes = status === 'RESOLVED' ? resolutionNotes[ticketId] : rejectionReasons[ticketId];
        
        if (!notes?.trim()) {
            alert(`Please provide ${status === 'RESOLVED' ? 'resolution notes' : 'a rejection reason'}.`);
            return;
        }

        try {
            setActionLoading(ticketId);
            await api.patch(`/tickets/${ticketId}/status`, {
                status,
                resolutionNotes: status === 'RESOLVED' ? notes : '',
                rejectionReason: status === 'REJECTED' ? notes : ''
            });
            
            // Clear notes
            if(status === 'RESOLVED') {
                 const {[ticketId]:_, ...rest} = resolutionNotes;
                 setResolutionNotes(rest);
            } else {
                 const {[ticketId]:_, ...rest} = rejectionReasons;
                 setRejectionReasons(rest);
            }
            
            setSuccess(`Ticket ${status === 'RESOLVED' ? 'resolved' : 'removed'} successfully!`);
            setTimeout(() => setSuccess(null), 5000);
            
            fetchTickets();
        } catch(e: any) {
            console.error("Failed to update ticket", e);
            alert("Failed to update ticket status.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteTicket = async (ticketId: string) => {
        if (!window.confirm("CRITICAL: Permanent incident record removal. Proceed?")) return;
        try {
            setActionLoading(ticketId);
            await api.delete(`/tickets/${ticketId}`);
            setSuccess("Incident report purged from central log.");
            setTimeout(() => setSuccess(null), 4000);
            fetchTickets();
        } catch (e: any) {
             console.error("Delete Error", e);
             alert(e.response?.data?.message || "Failed to remove incident record.");
        } finally {
             setActionLoading(null);
        }
    };

    const handleAddComment = async (ticketId: string) => {
        if(!newComment.trim()) return;
        try {
            setIsSubmittingComment(true);
            await api.post(`/tickets/${ticketId}/comments`, { content: newComment });
            setNewComment('');
            fetchComments(ticketId); // Refresh comments
        } catch(e) {
            console.error("Failed to add comment", e);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!description.trim() || !selectedResource) return;
        
        try {
            setIsSubmitting(true);
            
            // Auto generate title since design removed it
            const resObj = resources.find(r => r.id === selectedResource);
            const autoTitle = `${category.replace('_', ' ')} Issue in ${resObj?.name || 'Resource'}`;

            const payload: Record<string, any> = {
                title: autoTitle,
                description: description.trim(),
                priority,
                category,
            };
            // Only include resourceId if it's a real value (not empty/fallback)
            if (selectedResource && selectedResource !== 'db-empty') {
                payload.resourceId = selectedResource;
            }
            // Note: contactEmail / contactPhone / location are intentionally omitted
            // to avoid @Email / @Pattern validation failures on empty strings

            if (files.length > 0) {
                const formData = new FormData();
                const ticketBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                formData.append('ticket', ticketBlob);
                files.forEach(f => formData.append('files', f));
                
                // Must delete Content-Type so browser sets correct multipart boundary
                await api.post('/tickets', formData, {
                    headers: { 'Content-Type': undefined }
                });
            } else {
                await api.post('/tickets', payload);
            }
            
            setSuccess("Incident report submitted successfully!");
            setTimeout(() => setSuccess(null), 5000);
            
            // Refresh list and close modal
            fetchTickets();
            setIsReportModalOpen(false);
            setDescription('');
            setSelectedResource('');
            setFiles([]);
            setCreateError('');
            
        } catch (error: any) {
            console.error("Error creating ticket", error);
            const msg = error.response?.data?.message || error.message || 'Submission failed. Please check your connection.';
            setCreateError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Style Mappers
    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'OPEN': return 'border-red-500/30 text-red-500 hover:bg-red-500/10';
            case 'IN_PROGRESS': return 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10';
            case 'RESOLVED': return 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10';
            case 'CLOSED': return 'border-slate-500/30 text-slate-500 hover:bg-slate-500/10';
            case 'REJECTED': return 'border-orange-500/30 text-orange-500 hover:bg-orange-500/10';
            default: return 'border-slate-500/30 text-slate-500 hover:bg-slate-500/10';
        }
    };

    const getPriorityColors = (prio: string) => {
        switch(prio) {
            case 'LOW': return 'bg-emerald-500';
            case 'MEDIUM': return 'bg-amber-500';
            case 'HIGH': 
            case 'CRITICAL': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    // Filter Logic
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const matchesTab = 
                activeTab === 'All' ? true :
                activeTab === 'Open' ? t.status === 'OPEN' :
                activeTab === 'In Progress' ? t.status === 'IN_PROGRESS' :
                t.status === 'RESOLVED';
                
            const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  t.category.toLowerCase().includes(searchTerm.toLowerCase());
                                  
            return matchesTab && matchesSearch;
        });
    }, [tickets, activeTab, searchTerm]);

    // Derived Stats
    const openTicketsCount = tickets.filter(t => t.status === 'OPEN').length;
    const resolvedTicketsCount = tickets.filter(t => t.status === 'RESOLVED').length;
    const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300 pb-10 font-sans min-h-full">
            {/* Notifications */}
            {success && (
                <div className="fixed top-8 right-8 z-[10000] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(5,150,105,0.3)] flex items-center gap-4 border border-emerald-500/50">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Operational Log Updated</p>
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="ml-4 hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-slate-100 tracking-tight leading-tight">
                        Support Center
                    </h1>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">
                        Manage & Track Campus Maintenance
                    </p>
                </div>
                <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 transition-colors text-white rounded-xl text-xs font-black tracking-widest uppercase border border-indigo-400/50 flex items-center shadow-lg shadow-indigo-500/20 hover:scale-105"
                >
                    + Report Incident
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#181a20] border border-[#262832] rounded-2xl p-5 flex items-center justify-between shadow-xl">
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-rose-500 mb-1">Open Issues</p>
                        <p className="text-3xl font-black text-white">{openTicketsCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                        <AlertCircle className="w-6 h-6 text-rose-500" />
                    </div>
                </div>
                <div className="bg-[#181a20] border border-[#262832] rounded-2xl p-5 flex items-center justify-between shadow-xl">
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-amber-500 mb-1">In Progress</p>
                        <p className="text-3xl font-black text-white">{inProgressCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                        <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                </div>
                <div className="bg-[#181a20] border border-[#262832] rounded-2xl p-5 flex items-center justify-between shadow-xl">
                    <div>
                        <p className="text-[10px] font-black tracking-widest uppercase text-emerald-500 mb-1">Resolved</p>
                        <p className="text-3xl font-black text-white">{resolvedTicketsCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-[#181a20] p-3 border border-[#262832] rounded-2xl shadow-lg">
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
                    {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`shrink-0 px-5 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all ${
                                activeTab === tab
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#12141a] border border-[#262832] text-sm text-white px-4 py-2.5 pl-10 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600 font-medium"
                    />
                </div>
            </div>

            {/* Main Tickets List Wrapper */}
            <div className="bg-[#181a20] rounded-3xl border border-[#262832] shadow-[0_4px_20px_rgba(0,0,0,0.2)] p-2 min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-50">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Loading Incidents...</span>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-30">
                        <Wrench className="w-12 h-12 text-slate-500 mb-4" />
                        <span className="text-sm font-bold tracking-widest text-slate-400">No Tickets Found</span>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        {filteredTickets.map((ticket, i) => {
                            const barDotColor = getPriorityColors(ticket.priority);
                            const displayId = ticket.id.substring(0, 8).toUpperCase();
                            const timeAgo = ticket.createdAt ? formatDistanceToNow(parseISO(ticket.createdAt), { addSuffix: true }) : 'Unknown time';
                            const isExpanded = expandedTicketId === ticket.id;
                            
                            return (
                                <div key={i} className={`flex flex-col group rounded-2xl transition-all cursor-pointer relative border overflow-hidden ${isExpanded ? 'bg-[#1e2028] border-indigo-500/30' : 'bg-transparent border-[#262832]/30 hover:bg-white/[0.02] hover:border-[#262832]'}`}>
                                    
                                    {/* Main Row */}
                                    <div 
                                        className="flex items-center justify-between p-4"
                                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                                    >
                                        {/* Left colored bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${barDotColor} transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}></div>
                                        
                                        {/* Ticket Details */}
                                        <div className="flex flex-col pl-4">
                                            <h3 className={`text-sm font-bold mb-1 transition-colors ${isExpanded ? 'text-indigo-400' : 'text-slate-200 group-hover:text-indigo-400'}`}>
                                                {ticket.title}
                                            </h3>
                                            <div className="flex items-center text-[10px] font-medium text-slate-500 opacity-80 uppercase tracking-widest mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${barDotColor}`}></span>
                                                {ticket.priority.replace('_', ' ')} • #{displayId} • {ticket.category.replace('_', ' ')} • {timeAgo}
                                            </div>
                                        </div>

                                        {/* Right Status Pill & Chevron */}
                                        <div className="flex items-center gap-2 pr-2">
                                            {role === 'ADMIN' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket.id); }}
                                                    className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 mr-2"
                                                    title="Permanently Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <span className={`text-[10px] uppercase tracking-wider font-black border px-4 py-1.5 rounded-full transition-colors hidden sm:block ${getStatusStyles(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-400' : 'group-hover:translate-x-1'}`} />
                                        </div>
                                    </div>

                                    {/* Expanded Details Panel */}
                                    {isExpanded && (
                                        <div className="border-t border-[#262832] p-6 ml-4 bg-[#1a1c23] animate-in slide-in-from-top-2 duration-300">
                                            <div className="mb-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</h4>
                                                <p className="text-sm font-medium leading-relaxed text-slate-300">{ticket.description}</p>
                                            </div>
                                            
                                            {ticket.attachmentUrls && ticket.attachmentUrls.length > 0 && (
                                                <div className="mb-6">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Evidence Attached</h4>
                                                    <div className="flex gap-3">
                                                        {ticket.attachmentUrls.map((_: string, idx: number) => (
                                                            <div key={idx} className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                                <Paperclip className="w-4 h-4 text-slate-500" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between pt-4 pb-6 border-t border-[#262832]/50">
                                                <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Wrench className="w-3.5 h-3.5" /> Maintenance Required
                                                    </div>
                                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                                    <span>Location: {ticket.location || 'Unknown Facility'}</span>
                                                </div>
                                                <span className={`sm:hidden text-[10px] uppercase tracking-wider font-black border px-3 py-1 rounded-full ${getStatusStyles(ticket.status)}`}>
                                                    {ticket.status.replace('_', ' ')}
                                                </span>
                                            </div>

                                            {/* Resolution / Admin Actions */}
                                            {(role === 'ADMIN' || role === 'TECHNICIAN') && (ticket.status === 'IN_PROGRESS' || ticket.status === 'OPEN') && (
                                                <div className="mb-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 animate-in slide-in-from-left-2 duration-400">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                                                        <Wrench className="w-3.5 h-3.5" /> Professional Action Required
                                                    </h5>
                                                    
                                                    {ticket.status === 'IN_PROGRESS' ? (
                                                        <div className="space-y-4">
                                                            <textarea 
                                                                placeholder="Technical Resolution Notes: Describe what was fixed..."
                                                                className="w-full bg-[#12141a] border border-[#262832] p-4 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none font-medium h-24"
                                                                value={resolutionNotes[ticket.id] || ''}
                                                                onChange={(e) => setResolutionNotes({...resolutionNotes, [ticket.id]: e.target.value})}
                                                            />
                                                            <button 
                                                                disabled={actionLoading === ticket.id}
                                                                onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                                            >
                                                                {actionLoading === ticket.id ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <><CheckCircle2 className="w-4 h-4" /> Mark as Successfully Resolved</>}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col gap-3">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Reason for rejection (e.g. Duplicate, Insufficient Info)..."
                                                                    className="w-full bg-[#12141a] border border-[#262832] p-3 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-red-500/30"
                                                                    value={rejectionReasons[ticket.id] || ''}
                                                                    onChange={(e) => setRejectionReasons({...rejectionReasons, [ticket.id]: e.target.value})}
                                                                />
                                                                <button 
                                                                    disabled={actionLoading === ticket.id}
                                                                    onClick={() => handleUpdateStatus(ticket.id, 'REJECTED')}
                                                                    className="py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                                                                >
                                                                    {actionLoading === ticket.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Refuse Incident'}
                                                                </button>
                                                            </div>
                                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Technician assignment must be handled via Command Console</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Discussion / Comments Section */}
                                            <div className="border-t border-[#262832]/80 pt-6">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Operations Log & Comments</h4>
                                                
                                                <div className="space-y-4 mb-5 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                    {comments.length === 0 ? (
                                                        <p className="text-xs text-slate-500 font-medium italic">No comments yet.</p>
                                                    ) : (
                                                        comments.map((comment, cidx) => (
                                                            <div key={cidx} className="bg-[#12141a] p-3 rounded-xl border border-[#262832]/50 relative">
                                                                <p className="text-xs text-slate-300 leading-relaxed mb-2">{comment.content}</p>
                                                                <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black text-slate-500">
                                                                    <span>{comment.authorName}</span>
                                                                    <span>{formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}</span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Add Comment Box */}
                                                <div className="flex items-end gap-3 mt-4">
                                                    <div className="flex-1">
                                                        <textarea 
                                                            rows={2}
                                                            value={newComment}
                                                            onChange={e => setNewComment(e.target.value)}
                                                            className="w-full bg-[#12141a] border border-[#262832] p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-medium"
                                                            placeholder="Add a comment or operational update..."
                                                        />
                                                    </div>
                                                    <button 
                                                        onClick={() => handleAddComment(ticket.id)}
                                                        disabled={isSubmittingComment || !newComment.trim()}
                                                        className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-[#262832] text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all mb-1"
                                                    >
                                                        {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                                                    </button>
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Report Modal - rendered via portal to escape stacking contexts */}
            {isReportModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 border border-[#2b2d38] shadow-2xl">
                        
                        {/* Header */}
                        <div className="px-6 py-5 flex justify-between items-center bg-[#181a20]">
                            <h3 className="font-extrabold text-[16px] text-white">
                                Report Incident
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)} className="bg-[#262832] hover:bg-[#343746] rounded-xl p-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 pt-2 bg-[#181a20]">
                            <form onSubmit={handleCreateTicket} className="space-y-5">
                                {createError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex items-center animate-in fade-in zoom-in-95">
                                        <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                                        {createError}
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Resource <span className="text-red-500">*</span></label>
                                        <select required value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium">
                                            <option value="" disabled>Choose...</option>
                                            {resources && resources.length > 0 ? (
                                                resources.map((r: any) => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="1">LH-301 (Lecture Hall)</option>
                                                    <option value="2">Lab A-12 (Lab)</option>
                                                    <option value="3">MR-05 (Meeting Room)</option>
                                                    <option value="4">General Area</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Category <span className="text-red-500">*</span></label>
                                        <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium">
                                            <option value="IT_INFRASTRUCTURE">IT Infrastructure</option>
                                            <option value="ELECTRICAL">Electrical</option>
                                            <option value="HVAC">HVAC</option>
                                            <option value="PLUMBING">Plumbing</option>
                                            <option value="STRUCTURAL">Structural</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Priority <span className="text-red-500">*</span></label>
                                    <select required value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium">
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest text-[#94a3b8]">Description <span className="text-red-500 font-bold">* Required</span></label>
                                    <textarea 
                                        required 
                                        rows={3} 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="TYPE HERE: Describe the issue in detail..." 
                                        className={`w-full px-4 py-3 bg-[#12141a] border border-[#334155] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-medium resize-none ${description.trim() ? 'border-emerald-500/30' : 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.05)]'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Attach Evidence (Max 3)</label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    const selected = Array.from(e.target.files).slice(0, 3);
                                                    setFiles(selected);
                                                }
                                            }}
                                        />
                                        <div className={`border border-dashed ${files.length > 0 ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-[#262832] bg-[#12141a] hover:border-blue-500/30'} rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center`}>
                                            <Paperclip className={`w-5 h-5 ${files.length > 0 ? 'text-indigo-400' : 'text-slate-500'} mb-3`} />
                                            <div className={`text-[12px] font-medium ${files.length > 0 ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                {files.length > 0 
                                                    ? `${files.length} file(s) attached` 
                                                    : <><span className="text-blue-500 font-bold">Browse</span> or drop images</>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-600 mt-2 font-black uppercase tracking-widest text-right">JPG, PNG only. Max 5MB each.</p>
                                </div>

                                <div className="flex justify-end pt-4 space-x-3">
                                    <button type="button" onClick={() => setIsReportModalOpen(false)} className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-[#262832] text-slate-400 rounded-xl text-[12px] font-bold transition-all">
                                        Cancel
                                    </button>
                                    <button disabled={isSubmitting} type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[12px] font-bold shadow-[0_4px_15px_rgba(37,99,235,0.3)] border border-blue-400/30 transition-all flex items-center justify-center min-w-[140px] cursor-pointer active:scale-95">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Incident"}
                                    </button>
                                </div>
                                <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-black text-right pr-2">Fields with * are required</p>
                            </form>
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
}
