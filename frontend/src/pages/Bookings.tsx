import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Loader2, CalendarX2, X, AlertTriangle, ScanLine, ShieldCheck, ShieldAlert, Clock, Calendar as CalendarIcon } from 'lucide-react';
import api from '../services/api';
import { format, parseISO } from 'date-fns';

type Booking = {
    id: string;
    resourceId?: string;
    resourceName?: string;
    resourceType?: string;
    resourceLocation?: string;
    date: any; // backend sends array [2026, 3, 27] or ISO
    startTime: any; // backend sends [9, 0] or ISO
    endTime: any;
    purpose: string;
    status: string;
    userName?: string; 
    user?: { fullName: string; email: string };
    resource?: { id: string; name: string; type: string };
    qrCode?: string;
};

export default function Bookings() {
    const [activeTab, setActiveTab] = useState('All');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [resources, setResources] = useState<any[]>([]);
    
    // Form State
    const [selectedResource, setSelectedResource] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expectedAttendees, setExpectedAttendees] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editBookingId, setEditBookingId] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // QR & Scanner Status
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedQr, setSelectedQr] = useState<any>(null); // Legacy, will unify
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanIdInput, setScanIdInput] = useState('');
    const [scanResult, setScanResult] = useState<{success: boolean, message: string} | null>(null);
    const scannerInputRef = useRef<HTMLInputElement>(null);

    // Admin Review State
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const [bookRes, resRes] = await Promise.all([
                api.get('/bookings'),
                api.get('/resources')
            ]);
            setBookings(bookRes.data);
            const resData = resRes.data || [];
            setResources(resData);
            
            // Auto-select first resource if none selected to enable submit button
            if (resData.length > 0 && !selectedResource) {
                setSelectedResource(resData[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResource || !bookingDate || !startTime || !endTime) return;
        
        // Basic validation for dates
        const now = new Date();
        const start = new Date(`${bookingDate}T${startTime}`);
        if(start < now && !isEditMode) {
             alert("Booking date cannot be in the past.");
             return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                resourceId: selectedResource,
                date: bookingDate,
                startTime: startTime,
                endTime: endTime,
                purpose: purpose,
                expectedAttendees: expectedAttendees ? parseInt(expectedAttendees) : 1
            };

            if (isEditMode && editBookingId) {
                await api.put(`/bookings/${editBookingId}`, payload);
            } else {
                await api.post('/bookings', payload);
            }
            
            // Success reset
            setIsBookingModalOpen(false);
            setIsEditMode(false);
            setEditBookingId(null);
            setBookingDate('');
            setStartTime('');
            setEndTime('');
            setPurpose('');
            setExpectedAttendees('');
            setSelectedResource('');
            
            setSuccess(`Booking ${isEditMode ? 'updated' : 'created'} successfully!`);
            setTimeout(() => setSuccess(null), 5000);
            
            fetchBookings(); // Refresh live table
        } catch (error: any) {
            console.error("Booking Error", error);
            alert(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} booking. Time slot conflict detected.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("CRITICAL: This will permanently remove the record. Proceed?")) return;
        try {
            setActionLoading(id);
            await api.delete(`/bookings/${id}`);
            setSelectedBooking(null);
            setSuccess("Record permanently removed.");
            setTimeout(() => setSuccess(null), 4000);
            fetchBookings();
        } catch (error: any) {
             console.error("Delete Error", error);
             alert(error.response?.data?.message || "Failed to delete booking.");
        } finally {
             setActionLoading(null);
        }
    };

    const handleOpenEdit = (b: Booking) => {
        setIsEditMode(true);
        setEditBookingId(b.id);
        setSelectedResource(b.resourceId || b.resource?.id || '');
        
        // Extract date and times from potentially array or ISO
        const toTimeStr = (val: any) => {
             if (Array.isArray(val)) return `${String(val[3]).padStart(2,'0')}:${String(val[4]).padStart(2,'0')}`;
             if (typeof val === 'string' && val.includes('T')) return format(parseISO(val), 'HH:mm');
             if (typeof val === 'string') return val.substring(0, 5); // Fallback for HH:mm strings
             return '';
        };
        const toDateStr = (val: any) => {
             if (Array.isArray(val)) return `${val[0]}-${String(val[1]).padStart(2,'0')}-${String(val[2]).padStart(2,'0')}`;
             if (typeof val === 'string') return format(parseISO(val), 'yyyy-MM-dd');
             return '';
        };

        setBookingDate(toDateStr(b.startTime));
        setStartTime(toTimeStr(b.startTime));
        setEndTime(toTimeStr(b.endTime));
        setPurpose(b.purpose);
        setExpectedAttendees('1'); // Use default or original if added to DTO
        
        setSelectedBooking(null); // Close details
        setIsBookingModalOpen(true);
    };

    const handleReview = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
        try {
            setActionLoading(id);
            const notes = decision === 'APPROVED' ? 'Approved by Admin' : rejectionReasons[id];
            
            if (decision === 'REJECTED' && !notes) {
                alert("Please provide a reason for rejection.");
                return;
            }

            await api.patch(`/bookings/${id}/review`, {
                decision,
                adminNotes: notes
            });

            // Refresh data
            fetchBookings();
            setSuccess(`Booking ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
            setTimeout(() => setSuccess(null), 4000);
            
            // Clear reason if exists
            const { [id]: _, ...rest } = rejectionReasons;
            setRejectionReasons(rest);
        } catch (error: any) {
            console.error("Review Error", error);
            alert("Failed to update booking status.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCheckInScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setScanResult(null);
        if (!scanIdInput.trim()) return;

        let extractedId = scanIdInput.trim();
        if (extractedId.includes('BOOKING_ID:')) {
            const match = extractedId.match(/BOOKING_ID:([^|]+)/);
            if (match) extractedId = match[1];
        } else {
            // Support manually pasted short Refs
            const matchedBooking = bookings.find(b => b.id.toUpperCase().startsWith(extractedId.toUpperCase()));
            if (matchedBooking) {
                extractedId = matchedBooking.id;
            }
        }

        try {
            await api.post(`/bookings/${extractedId}/checkin`);
            const msg = 'VERIFIED: Access Granted! Checked-In successfully.';
            setScanResult({ success: true, message: msg });
            setSuccess(msg);
            setTimeout(() => setSuccess(null), 4000);
            fetchBookings();
            setTimeout(() => { setScanIdInput(''); setScanResult(null); setIsScannerOpen(false) }, 3000); // auto close
        } catch(error: any) {
            setScanResult({ success: false, message: error.response?.data?.message || 'DENIED: Invalid ID or Unauthorized Access.' });
        }
    };

    useEffect(() => {
        if (isScannerOpen && scannerInputRef.current) {
            scannerInputRef.current.focus();
        }
    }, [isScannerOpen]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleOpenNewBooking = () => {
        setIsBookingModalOpen(true);
        
        // Auto-fill today and now
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setBookingDate(`${year}-${month}-${day}`);

        const startH = String(d.getHours()).padStart(2, '0');
        const startM = String(d.getMinutes()).padStart(2, '0');
        setStartTime(`${startH}:${startM}`);

        const endD = new Date(d.getTime() + 60 * 60 * 1000);
        const endH = String(endD.getHours()).padStart(2, '0');
        const endM = String(endD.getMinutes()).padStart(2, '0');
        setEndTime(`${endH}:${endM}`);
        
        // Ensure starting purpose is empty
        setPurpose('');
        setExpectedAttendees('25');
    };

    const handleCancel = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await api.patch(`/bookings/${id}/cancel`);
            fetchBookings();
        } catch (error: any) {
            console.error("Cancel Error", error);
            alert(error.response?.data?.message || "Failed to cancel booking.");
        }
    };

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Approval Queue') return b.status === 'PENDING';
        if (activeTab === 'Pending') return b.status === 'PENDING';
        if (activeTab === 'Approved') return b.status === 'APPROVED';
        if (activeTab === 'Checked-In') return b.status === 'CHECKED_IN';
        if (activeTab === 'Rejected') return b.status === 'REJECTED';
        if (activeTab === 'Cancelled') return b.status === 'CANCELLED';
        return true;
    });

    const role = localStorage.getItem('userRole') || 'USER';

    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'APPROVED': return 'border-blue-500/30 text-blue-400 bg-blue-500/10';
            case 'PENDING': return 'border-amber-500/30 text-amber-500 bg-amber-500/10';
            case 'CHECKED_IN': return 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10';
            case 'REJECTED': return 'border-red-500/30 text-red-500 bg-red-500/10';
            case 'CANCELLED': return 'border-slate-500/30 text-slate-400 bg-slate-500/10';
            default: return 'border-slate-500/30 text-slate-400 bg-[#12141a]';
        }
    };



    const formatDateTime = (booking: Booking) => {
        try {
            const { date, startTime, endTime } = booking;
            const toDate = (dateVal: any, timeVal: any): Date => {
                // Parse Date part
                let y, mo, d;
                if (Array.isArray(dateVal)) [y, mo, d] = dateVal;
                else {
                    const parsed = parseISO(dateVal);
                    y = parsed.getFullYear();
                    mo = parsed.getMonth() + 1;
                    d = parsed.getDate();
                }

                // Parse Time part
                let h = 0, mi = 0;
                if (Array.isArray(timeVal)) [h, mi] = timeVal;
                else if (typeof timeVal === 'string') {
                    if (timeVal.includes('T')) {
                        const pt = parseISO(timeVal);
                        h = pt.getHours();
                        mi = pt.getMinutes();
                    } else {
                        const [sh, sm] = timeVal.split(':').map(Number);
                        h = sh; mi = sm;
                    }
                }
                return new Date(y, mo - 1, d, h, mi);
            };

            const startDate = toDate(date, startTime);
            const endDate = toDate(date, endTime);
            if (isNaN(startDate.getTime())) return 'TBD';
            return `${format(startDate, 'dd MMM yyyy')} · ${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')}`;
        } catch (e) {
            console.error("Format date error", e);
            return 'TBD';
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300 pb-10 font-sans min-h-full">
            {/* Notifications */}
            {success && (
                <div className="fixed top-8 right-8 z-[10000] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(16,185,129,0.3)] flex items-center gap-4 border border-emerald-400/50">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">System Alert</p>
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="ml-4 hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[32px] font-extrabold text-white tracking-tight leading-tight">
                        Booking Dashboard
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">
                        Operational Flow Control Center
                    </p>
                </div>
                <div className="flex gap-3">
                    {role === 'ADMIN' && (
                        <button onClick={() => setIsScannerOpen(true)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white rounded-lg text-xs font-black tracking-wide border border-emerald-400/50 flex items-center shadow-lg shadow-emerald-500/20 cursor-pointer">
                            <ScanLine className="w-4 h-4 mr-2" /> Security Scan
                        </button>
                    )}
                    <button onClick={handleOpenNewBooking} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 transition-colors text-white rounded-lg text-xs font-black tracking-wide border border-blue-400/50 flex items-center shadow-lg shadow-blue-600/20 cursor-pointer">
                        + New Booking
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-emerald-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Live</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'APPROVED' || b.status === 'CHECKED_IN').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Confirmed Access</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-amber-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-amber-500">Action Required</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'PENDING').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Awaiting Approval</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-blue-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <Smartphone className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-400">Validated</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'CHECKED_IN').length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Check-ins Complete</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Smartphone className="w-16 h-16 text-white" />
                    </div>
                </div>

                <div className="bg-[#181a20] rounded-2xl border border-[#262832] p-5 flex flex-col group hover:border-slate-500/20 transition-all shadow-xl relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="w-9 h-9 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                            <CalendarIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">History</span>
                    </div>
                    <h4 className="text-2xl font-black text-white">{bookings.length}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Reservations</p>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <CalendarIcon className="w-16 h-16 text-white" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3 mb-8 overflow-x-auto custom-scrollbar pb-2">
                {role === 'ADMIN' && (
                    <button
                        onClick={() => setActiveTab('Approval Queue')}
                        className={`shrink-0 px-5 py-2 rounded-full text-[11px] font-black tracking-widest transition-all border flex items-center gap-2 ${
                            activeTab === 'Approval Queue'
                                ? 'border-amber-500/50 text-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                : 'border-amber-500/20 text-slate-500 bg-transparent hover:bg-amber-500/5'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" /> APPROVAL QUEUE
                        <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-md text-[8px] ml-1">{bookings.filter(b => b.status === 'PENDING').length}</span>
                    </button>
                )}
                {['All', 'Pending', 'Approved', 'Checked-In', 'Rejected', 'Cancelled'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all border ${
                            activeTab === tab
                                ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : 'border-[#262832] text-slate-400 bg-[#12141a] hover:bg-white/5'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Table Wrapper */}
            <div className="bg-[#181a20] rounded-2xl border border-[#262832] shadow-[0_4px_20px_rgba(0,0,0,0.2)] overflow-x-auto min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-50 h-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Loading Bookings...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-30 h-full">
                        <CalendarX2 className="w-12 h-12 text-slate-500 mb-4" />
                        <span className="text-sm font-bold tracking-widest text-slate-400">No Bookings Found</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#262832] bg-[#12141a]/40 text-left">
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">ID</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">RESOURCE</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">DATE & TIME</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">PURPOSE</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">BY</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap">STATUS</th>
                                <th className="py-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-300 divide-y divide-[#262832]/80">
                            {filteredBookings.map((row, i) => {
                                const resourceName = row.resource?.name || row.resourceName || 'Unknown Resource';
                                const resourceType = row.resource?.type || row.resourceType || 'General';
                                const fullName = row.user?.fullName || row.userName || 'Unknown User';
                                const initials = getInitials(fullName);
                                const displayId = row.id ? row.id.substring(0, 8).toUpperCase() : 'UNKNOWN';
                                
                                return (
                                    <tr key={i} className={`hover:bg-white/[0.02] transition-colors group ${activeTab === 'Approval Queue' ? 'border-l-2 border-amber-500/30' : ''}`}>
                                        <td className="py-5 px-6 whitespace-nowrap text-slate-400 font-black">#{displayId}</td>
                                        
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-slate-200 text-[13px]">{resourceName}</span>
                                                <span className="text-[10px] text-slate-500 font-medium capitalize mt-0.5">{resourceType.replace('_', ' ').toLowerCase()}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="py-5 px-6 whitespace-nowrap text-slate-400 font-medium">
                                            {formatDateTime(row)}
                                        </td>
                                        
                                        <td className="py-5 px-6 font-medium max-w-[200px] overflow-hidden text-ellipsis">
                                            <div className="text-slate-400 line-clamp-1" title={row.purpose}>{row.purpose}</div>
                                        </td>
                                        
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black tracking-tighter bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                                                    {initials}
                                                </div>
                                                <span className="text-slate-300 text-[13px]">{fullName}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="py-5 px-6 whitespace-nowrap">
                                            <span className={`text-[10px] uppercase tracking-wider font-black border px-3 py-1.5 rounded-full ${getStatusStyles(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        
                                        <td className="py-5 px-6 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => setSelectedBooking(row)}
                                                className="text-[10px] tracking-widest font-black border border-[#262832] text-slate-400 hover:text-white hover:bg-white/5 px-4 py-1.5 rounded-lg transition-all uppercase"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Application Modal - rendered via portal to escape stacking contexts */}
            {isBookingModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/75 z-[9999] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 border border-[#2b2d38] shadow-2xl">
                        
                        {/* Header */}
                        <div className="px-6 py-5 flex justify-between items-center bg-[#181a20]">
                            <h3 className="font-extrabold text-[16px] text-white">
                                {isEditMode ? 'Modify Reservation' : 'New Booking Request'}
                            </h3>
                            <button onClick={() => { setIsBookingModalOpen(false); setIsEditMode(false); }} className="bg-[#262832] hover:bg-[#343746] rounded-xl p-2 text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 pt-2 bg-[#181a20]">
                            <form onSubmit={submitBooking} className="space-y-5">
                                
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Select Resource <span className="text-red-500">*</span></label>
                                    <select required value={selectedResource} onChange={e => setSelectedResource(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium block">
                                        <option value="" disabled>Choose...</option>
                                        {resources.length > 0 ? resources.map(r => (
                                            <option key={r.id} value={r.id}>{r.name} {r.type ? `(${r.type.replace('_', ' ')})` : ''}</option>
                                        )) : (
                                            <>
                                                <option value="db-empty" disabled>No resources in database. Please Add a Resource first.</option>
                                                <option value="1">LH-301 (Lecture Hall)</option>
                                                <option value="2">Lab A-12 (Lab)</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Date <span className="text-red-500">*</span></label>
                                        <input required type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Attendees <span className="text-red-500">*</span></label>
                                        <input required type="number" min="1" placeholder="25" value={expectedAttendees} onChange={e => setExpectedAttendees(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Start <span className="text-red-500">*</span></label>
                                        <input required type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">End <span className="text-red-500">*</span></label>
                                        <input required type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium [color-scheme:dark]" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Purpose <span className="text-red-500">*</span></label>
                                    <input required type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. IT3030 Lab Session" className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium" />
                                </div>

                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold rounded-xl flex items-center mt-2">
                                    <AlertTriangle className="w-4 h-4 mr-2" /> Conflict check performed automatically on submission
                                </div>

                                <div className="flex justify-end pt-4 space-x-3">
                                    <button type="button" onClick={() => setIsBookingModalOpen(false)} className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-[#262832] text-slate-400 rounded-xl text-[12px] font-bold transition-all">
                                        Cancel
                                    </button>
                                    <button disabled={isSubmitting} type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[12px] font-bold shadow-[0_4px_15px_rgba(37,99,235,0.3)] border border-blue-400/30 transition-all flex items-center justify-center min-w-[135px] cursor-pointer">
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditMode ? "Save Changes" : "Submit Request")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* View QR Code Modal - portal */}
            {qrModalOpen && selectedQr && createPortal(
                <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] rounded-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2b2d38] shadow-2xl flex flex-col items-center p-8 text-center relative">
                        <button onClick={() => { setQrModalOpen(false); setSelectedQr(null); }} className="absolute top-4 right-4 bg-[#262832] hover:bg-[#343746] rounded-xl p-2 text-slate-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                        
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                            <Smartphone className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h3 className="font-extrabold text-[16px] text-white">Digital Access Pass</h3>
                        <p className="text-[11px] text-slate-500 mb-6 mt-1 font-medium">Present this QR code at {selectedQr.resource?.name || 'the facility'} to check in.</p>
                        
                        <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] border-4 border-[#262832]">
                            <img 
                                src={selectedQr.qrCode ? (selectedQr.qrCode.startsWith('data:') ? selectedQr.qrCode : `data:image/png;base64,${selectedQr.qrCode}`) : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BOOKING_ID:${selectedQr.id}`} 
                                alt="Access QR Code" 
                                className="w-48 h-48 object-contain"
                            />
                        </div>
                        
                        <div className="mt-8 bg-[#12141a] border border-[#262832] px-6 py-3 rounded-xl w-full">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Booking Ref</p>
                            <p className="text-[13px] font-black tracking-widest text-slate-300">{selectedQr.id.substring(0,8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Unified Details Modal */}
            {selectedBooking && createPortal(
                <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#181a20] rounded-3xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-[#2b2d38] shadow-2xl flex flex-col my-8">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-[#262832] flex justify-between items-center bg-[#12141a]/50">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Booking Details</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Reference: #{selectedBooking.id.substring(0,8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 bg-[#262832] hover:bg-[#343746] rounded-xl text-slate-400 hover:text-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">Resource</p>
                                    <p className="text-sm font-bold text-white">{selectedBooking.resource?.name || selectedBooking.resourceName}</p>
                                    <p className="text-[11px] text-slate-500 font-medium capitalize">{selectedBooking.resource?.type?.replace('_', ' ').toLowerCase() || 'Facility'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">Location</p>
                                    <p className="text-sm font-bold text-white">Campus Block A</p>
                                    <p className="text-[11px] text-slate-500 font-medium">Main University Campus</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-left">Scheduled Period</p>
                                    <p className="text-sm font-bold text-white">{formatDateTime(selectedBooking)}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Status</p>
                                    <span className={`inline-block text-[10px] uppercase font-black px-3 py-1 rounded-full mt-1 border ${getStatusStyles(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>

                            {/* QR Section - Only if Approved/Checked-in */}
                            {(selectedBooking.status === 'APPROVED' || selectedBooking.status === 'CHECKED_IN') && (
                                <div className="bg-[#12141a] border border-[#262832] rounded-2xl p-6 flex flex-col items-center justify-center mb-8">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Digital Pass</p>
                                    <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] border-2 border-[#262832]">
                                        <img 
                                            src={selectedBooking.qrCode ? (selectedBooking.qrCode.startsWith('data:') ? selectedBooking.qrCode : `data:image/png;base64,${selectedBooking.qrCode}`) : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=BOOKING_ID:${selectedBooking.id}`} 
                                            alt="Access QR Code" 
                                            className="w-32 h-32 object-contain"
                                        />
                                    </div>
                                    <p className="text-[10px] font-medium text-slate-500 mt-4">Present this code at the facility scanner</p>
                                </div>
                            )}

                            {/* Action Area */}
                            <div className="flex flex-col gap-3">
                                {role === 'ADMIN' && selectedBooking.status === 'PENDING' ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {rejectionReasons[selectedBooking.id] !== undefined ? (
                                            <div className="col-span-2 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Provide rejection reason..." 
                                                    className="w-full px-4 py-3 bg-[#12141a] border border-red-500/30 rounded-xl text-sm text-white focus:outline-none focus:border-red-500"
                                                    value={rejectionReasons[selectedBooking.id]}
                                                    onChange={(e) => setRejectionReasons({...rejectionReasons, [selectedBooking.id]: e.target.value})}
                                                />
                                                <div className="flex gap-2">
                                                    <button 
                                                        disabled={actionLoading === selectedBooking.id}
                                                        onClick={() => handleReview(selectedBooking.id, 'REJECTED')} 
                                                        className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-[11px] tracking-widest rounded-xl disabled:opacity-50"
                                                    >
                                                        {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirm Rejection"}
                                                    </button>
                                                    <button 
                                                        disabled={actionLoading === selectedBooking.id}
                                                        onClick={() => { const {[selectedBooking.id]:_,...r}=rejectionReasons; setRejectionReasons(r); }} 
                                                        className="px-6 py-3 bg-[#262832] text-slate-400 font-black uppercase text-[11px] tracking-widest rounded-xl disabled:opacity-50"
                                                    >
                                                        Back
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button 
                                                    disabled={actionLoading === selectedBooking.id}
                                                    onClick={() => setRejectionReasons({...rejectionReasons, [selectedBooking.id]: ''})} 
                                                    className="py-3 border border-red-500/20 text-red-500 hover:bg-red-500/5 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all disabled:opacity-50"
                                                >
                                                    Refuse
                                                </button>
                                                <button 
                                                    disabled={actionLoading === selectedBooking.id}
                                                    onClick={() => handleReview(selectedBooking.id, 'APPROVED')} 
                                                    className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                                                >
                                                    {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Grant Access"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex gap-3">
                                        {(selectedBooking.status === 'PENDING' || (role === 'ADMIN' && selectedBooking.status === 'APPROVED')) && (
                                            <button 
                                                disabled={actionLoading === selectedBooking.id}
                                                onClick={() => { handleCancel(selectedBooking.id); setSelectedBooking(null); }}
                                                className="flex-1 py-3 border border-red-500/30 text-red-500 hover:bg-red-500/5 font-black uppercase text-[11px] tracking-widest rounded-xl transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (selectedBooking.status === 'PENDING' ? 'Withdraw Request' : 'Revoke Booking')}
                                            </button>
                                        )}
                                        <button onClick={() => setSelectedBooking(null)} className="flex-1 py-3 bg-[#262832] text-slate-300 font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-[#323543] transition-all">Close</button>
                                        
                                        {((role === 'ADMIN') || (selectedBooking.status === 'PENDING')) && (
                                            <div className="flex gap-2 shrink-0">
                                                <button 
                                                    disabled={actionLoading === selectedBooking.id}
                                                    onClick={() => handleOpenEdit(selectedBooking)}
                                                    className="p-3 bg-white/5 border border-[#262832] text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all disabled:opacity-50"
                                                    title="Modify Record"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                </button>
                                                <button 
                                                    disabled={actionLoading === selectedBooking.id}
                                                    onClick={() => handleDelete(selectedBooking.id)}
                                                    className="p-3 bg-white/5 border border-[#262832] text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                                                    title="Permanently Remove"
                                                >
                                                    {actionLoading === selectedBooking.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            , document.body)}

            {/* Instant Security Scan Check-In Modal - portal */}
            {isScannerOpen && createPortal(
                <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2b2d38] shadow-2xl relative">
                        {/* Scanner Header */}
                        <div className="px-6 py-5 flex justify-between items-center bg-[#12141a] border-b border-[#262832]">
                            <h3 className="font-extrabold text-[16px] text-white flex items-center gap-2">
                                <ScanLine className="w-5 h-5 text-emerald-500" /> Security Verification
                            </h3>
                            <button onClick={() => { setIsScannerOpen(false); setScanResult(null); }} className="bg-[#262832] hover:bg-red-500 hover:text-white rounded-xl p-2 text-slate-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-8 pb-10">
                            {/* Animated Scanner HUD */}
                            <div className="w-full h-32 border-2 border-dashed border-emerald-500/30 rounded-xl mb-6 relative overflow-hidden bg-emerald-500/5 flex items-center justify-center flex-col">
                                <div className="w-full h-0.5 bg-emerald-500 absolute top-0 left-0 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_10px_#10b981]"></div>
                                <ScanLine className="w-10 h-10 text-emerald-500/50 mb-2" />
                                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-500/70">Awaiting QR Payload</span>
                            </div>

                            <form onSubmit={handleCheckInScan}>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest text-center">Simulate Scanner Input</label>
                                <div className="relative">
                                    <input 
                                        ref={scannerInputRef}
                                        required 
                                        type="text" 
                                        value={scanIdInput} 
                                        onChange={e => setScanIdInput(e.target.value)} 
                                        placeholder="Scan QR or paste Booking UUID..." 
                                        className="w-full px-4 py-4 pl-12 bg-[#12141a] border border-[#262832] rounded-xl text-[14px] text-emerald-400 font-bold tracking-wider focus:outline-none focus:border-emerald-500/50 hover:border-[#343746] transition-colors" 
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <ScanLine className="w-5 h-5" />
                                    </div>
                                    <button type="submit" className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 px-4 rounded-lg text-white font-black text-[11px] uppercase tracking-widest transition-colors shadow-lg">
                                        Verify
                                    </button>
                                </div>
                            </form>

                            {/* Result Display */}
                            {scanResult && (
                                <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 ${scanResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                                    {scanResult.success ? <ShieldCheck className="w-6 h-6 shrink-0" /> : <ShieldAlert className="w-6 h-6 shrink-0" />}
                                    <div>
                                        <h4 className={`text-[13px] font-black uppercase tracking-wider mb-1 ${scanResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {scanResult.success ? 'Access Granted' : 'Access Denied'}
                                        </h4>
                                        <p className="text-[11px] font-medium opacity-80">{scanResult.message}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            , document.body)}
        </div>
    );
}
