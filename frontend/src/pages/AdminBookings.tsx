import { useState, useEffect } from 'react';
import { XCircle, Search, Clock, QrCode, ClipboardCheck, Loader2, Check, X, Calendar, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import api from '../services/api';
import type { BookingResponse } from '../types';

export default function AdminBookings() {
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [allBookings, setAllBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'SCAN'>('PENDING');
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState<{ [id: string]: string }>({});
    const [filterResource, setFilterResource] = useState('ALL');
    const [filterDate, setFilterDate] = useState('');

    useEffect(() => {
        if (activeTab === 'PENDING') {
            fetchAllBookings();
        }
    }, [activeTab]);

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/bookings');
            const data = response.data || [];
            setAllBookings(data);
            setBookings(data.filter((b: BookingResponse) => b.status === 'PENDING'));
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: string, approved: boolean) => {
        try {
            setActionLoading(id);
            const reason = approved ? 'Approved by Admin' : rejectionReason[id];
            if (!approved && !reason) return;

            await api.patch(`/bookings/${id}/review`, {
                decision: approved ? 'APPROVED' : 'REJECTED',
                adminNotes: reason
            });
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Error updating booking status.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scanInput) return;

        let targetId = scanInput.trim();
        if (targetId.includes("BOOKING_ID:")) {
            const match = targetId.match(/BOOKING_ID:([^|]+)/);
            if (match) targetId = match[1];
        } else {
            const matchedBooking = bookings.find(b => b.id.toUpperCase().startsWith(targetId.toUpperCase()));
            if (matchedBooking) targetId = matchedBooking.id;
        }

        try {
            setActionLoading('scanning');
            setScanResult(null);
            await api.post(`/bookings/${targetId}/checkin`);
            setScanResult({ type: 'success', message: `Booking successfully checked in!` });
            setScanInput('');
        } catch (err: any) {
            console.error("Failed to check-in", err);
            setScanResult({
                type: 'error',
                message: err.response?.data?.message || err.message || "Invalid QR Code or Booking not approved."
            });
        } finally {
            setActionLoading(null);
        }
    };

    const formatDateTime = (dateStr: string, startStr: string, endStr: string) => {
        try {
            const date = parseISO(dateStr);
            return `${format(date, 'dd MMM yyyy')} · ${startStr} - ${endStr}`;
        } catch {
            return `${dateStr} · ${startStr} - ${endStr}`;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[32px] font-extrabold text-white tracking-tight leading-tight">Booking Operations</h1>
                    <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">Centralized Facility Control Hub</p>
                </div>
            </div>

            {/* Admin Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-blue-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">Urgent</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{allBookings.filter(b => b.status === 'PENDING').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Pending Approvals</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-emerald-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <Check className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Today</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{allBookings.filter(b => b.status === 'APPROVED' && b.date === new Date().toISOString().split('T')[0]).length || allBookings.filter(b => b.status === 'APPROVED').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Confirmed Access</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-indigo-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                            <Smartphone className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Security</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{allBookings.filter(b => b.status === 'CHECKED_IN').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Active Check-ins</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Smartphone className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-slate-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                            <Users className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Utilization</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{allBookings.length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Lifecycle</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-16 h-16 text-white" />
                    </div>
                </div>
            </div>

            <div className="bg-[#181a20] rounded-2xl border border-[#262832] shadow-2xl relative min-h-[500px] flex flex-col">
                {loading && activeTab === 'PENDING' && (
                    <div className="absolute inset-0 bg-[#000000]/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Retrieving Requests...</span>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="p-4 border-b border-[#262832] flex items-center gap-3 bg-[#12141a]/50 rounded-t-2xl">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`px-5 py-2.5 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'PENDING' ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <Clock className="w-3.5 h-3.5" /> Pending Approvals
                    </button>
                    <button
                        onClick={() => setActiveTab('SCAN')}
                        className={`px-5 py-2.5 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'SCAN' ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <QrCode className="w-3.5 h-3.5" /> QR Check-in
                    </button>
                </div>

                {activeTab === 'PENDING' && (
                    <div className="flex-1 flex flex-col">
                        {/* Filters */}
                        <div className="p-5 border-b border-[#262832] flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-[12px] font-black text-white uppercase tracking-wider">Pending Requests</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <select
                                    value={filterResource}
                                    onChange={(e) => setFilterResource(e.target.value)}
                                    className="px-4 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[11px] font-bold text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                                >
                                    <option value="ALL">All Types</option>
                                    <option value="LECTURE_HALL">Lecture Hall</option>
                                    <option value="LAB">Lab</option>
                                    <option value="MEETING_ROOM">Meeting Room</option>
                                </select>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                    <input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[11px] font-bold text-slate-300 outline-none [color-scheme:dark]"
                                    />
                                </div>
                                <div className="relative flex-1 md:w-56">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search user or ID..."
                                        className="w-full pl-9 pr-4 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Booking List */}
                        <div className="divide-y divide-[#262832] flex-1">
                            {!loading && bookings.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                        <Check className="w-8 h-8 text-emerald-500" strokeWidth={3} />
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2">Queue Clear</h3>
                                    <p className="text-slate-500 text-sm max-w-xs mx-auto">All pending bookings have been processed. Great work!</p>
                                </div>
                            )}

                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-[#12141a]/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-black text-white">{booking.resourceName}</h4>
                                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Pending</span>
                                        </div>
                                        <p className="text-slate-400 text-[13px] font-medium leading-relaxed max-w-lg">
                                            <span className="text-slate-600 mr-2 uppercase text-[10px] font-black">Purpose</span>
                                            {booking.purpose}
                                        </p>
                                        <div className="flex flex-wrap items-center text-[11px] font-bold text-slate-500 gap-4 mt-2">
                                            <span className="flex items-center gap-1.5 bg-[#12141a] px-3 py-1.5 rounded-lg border border-[#262832]">
                                                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                                                {formatDateTime(booking.date, booking.startTime, booking.endTime)}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-[#12141a] px-3 py-1.5 rounded-lg border border-[#262832]">
                                                <Users className="w-3.5 h-3.5 text-indigo-400" />
                                                User {booking.userId.substring(0,8).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        {rejectionReason[booking.id] !== undefined ? (
                                            <div className="flex flex-col gap-2 animate-in slide-in-from-right-2">
                                                <input
                                                    type="text"
                                                    placeholder="Reason for rejection..."
                                                    autoFocus
                                                    value={rejectionReason[booking.id]}
                                                    onChange={(e) => setRejectionReason({ ...rejectionReason, [booking.id]: e.target.value })}
                                                    className="px-4 py-2.5 bg-[#12141a] border border-red-500/30 rounded-xl text-[12px] text-red-200 placeholder-red-900/50 outline-none focus:border-red-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApproval(booking.id, false)}
                                                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Confirm Reject
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const { [booking.id]: _, ...rest } = rejectionReason;
                                                            setRejectionReason(rest);
                                                        }}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setRejectionReason({ ...rejectionReason, [booking.id]: '' })}
                                                    disabled={actionLoading === booking.id}
                                                    className="flex-1 px-4 py-2.5 bg-[#1c1214] border border-red-500/20 text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Reject
                                                </button>
                                                <button
                                                    onClick={() => handleApproval(booking.id, true)}
                                                    disabled={actionLoading === booking.id}
                                                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all disabled:opacity-50 shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'SCAN' && (
                    <div className="p-12 md:p-24 flex flex-col items-center justify-center flex-1">
                        <div className="w-24 h-24 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl border border-blue-500/20">
                            <QrCode className="w-12 h-12" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Security Check-in</h2>
                        <p className="text-slate-500 text-center max-w-sm mb-10 text-sm font-medium leading-relaxed italic">
                            Scanning ensures facility security and tracks attendance in real-time.
                        </p>

                        <form onSubmit={handleScan} className="w-full max-w-md">
                            <div className="relative group">
                                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="BOOKING_ID:..."
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    className="w-full py-4 pl-14 pr-32 bg-[#12141a] border border-[#262832] rounded-2xl text-[14px] text-blue-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tracking-wider"
                                />
                                <button
                                    type="submit"
                                    disabled={!scanInput || actionLoading === 'scanning'}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg transition-all"
                                >
                                    {actionLoading === 'scanning' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Access"}
                                </button>
                            </div>
                        </form>

                        {scanResult && (
                            <div className={`mt-8 w-full max-w-md p-5 rounded-2xl flex items-start gap-4 border animate-in zoom-in-95 duration-200 ${scanResult.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${scanResult.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    {scanResult.type === 'success' ? <ClipboardCheck className="w-6 h-6 shrink-0" strokeWidth={3} /> : <XCircle className="w-6 h-6 shrink-0" strokeWidth={3} />}
                                </div>
                                <div className="pt-0.5">
                                    <h4 className="font-black uppercase text-[12px] tracking-widest mb-1">{scanResult.type === 'success' ? 'Authenticated' : 'System Error'}</h4>
                                    <p className="text-[13px] font-medium opacity-80">{scanResult.message}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

