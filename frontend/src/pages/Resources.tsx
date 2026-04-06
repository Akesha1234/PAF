import { useState, useEffect } from 'react';
import { MonitorPlay, Users, LayoutDashboard, Settings, X, Calendar, ShieldCheck, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import type { Resource, BookingRequest } from '../types';

export default function Resources() {

    const location = useLocation();
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterCapacity, setFilterCapacity] = useState('ALL');
    const [filterLocation, setFilterLocation] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Booking Modal State
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expectedAttendees, setExpectedAttendees] = useState<number | ''>('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [userRole, setUserRole] = useState('USER');

    // Resource Management Modal State (Handles both Add & Edit)
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editResourceId, setEditResourceId] = useState<string | null>(null);
    const [addName, setAddName] = useState('');
    const [addType, setAddType] = useState('LECTURE_HALL');
    const [addCapacity, setAddCapacity] = useState('100');
    const [addStatus, setAddStatus] = useState('ACTIVE');
    const [addLocation, setAddLocation] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const handleOpenEdit = (res: Resource) => {
        setIsEditing(true);
        setEditResourceId(res.id);
        setAddName(res.name);
        setAddType(res.type);
        setAddCapacity(String(res.capacity || ''));
        setAddStatus(res.status);
        setAddLocation(res.location);
        setIsManageModalOpen(true);
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditResourceId(null);
        setAddName('');
        setAddType('LECTURE_HALL');
        setAddCapacity('100');
        setAddStatus('ACTIVE');
        setAddLocation('');
        setIsManageModalOpen(true);
    };

    useEffect(() => {
        setUserRole(localStorage.getItem('userRole') || 'USER');
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/resources');
            setResources(response.data);

            // Check if we should open the booking modal automatically
            const params = new URLSearchParams(location.search);
            if (params.get('action') === 'book' && response.data.length > 0) {
                // If there's a search term in the URL, the filtered resources might be different
                // but for now let's just use the first available one or the first in list
                const initialRes = response.data.find((r: Resource) => r.status === 'ACTIVE') || response.data[0];
                handleBookNow(initialRes);
            }
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (resource: Resource) => {
        setSelectedResource(resource);
        setBookingSuccess(false);
        setBookingError('');
        setPurpose(''); // Clear for new session
        setExpectedAttendees(''); // Clear for new session

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
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResource) return;

        if (!bookingDate || !startTime || !endTime || !purpose || !expectedAttendees) {
            setBookingError('Please fill out all required fields before confirming.');
            return;
        }

        if (startTime >= endTime) {
            setBookingError('End time must be after the start time.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (bookingDate < today) {
            setBookingError('Booking date cannot be in the past.');
            return;
        }

        try {
            setBookingLoading(true);
            setBookingError('');

            const payload: BookingRequest = {
                resourceId: selectedResource.id,
                date: bookingDate,
                startTime: startTime,
                endTime: endTime,
                purpose: purpose,
                expectedAttendees: Number(expectedAttendees)
            };

            await api.post('/bookings', payload);
            setBookingSuccess(true);

            setBookingDate('');
            setStartTime('');
            setEndTime('');
            setPurpose('');
            setExpectedAttendees('');

        } catch (error: any) {
            console.error("Failed to submit booking", error);
            const data = error.response?.data;
            if (data?.fieldErrors && data.fieldErrors.length > 0) {
                setBookingError(data.fieldErrors[0].message);
            } else {
                setBookingError(data?.message || 'Failed to create booking. Please check for conflicts.');
            }
        } finally {
            setBookingLoading(false);
        }
    };

    const submitAddResource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setAddLoading(true);
            const payload = {
                name: addName,
                type: addType,
                capacity: addCapacity ? parseInt(addCapacity) : 0,
                status: addStatus,
                location: addLocation,
                features: 'Standard',
                description: 'Campus resource'
            };
            
            if (isEditing && editResourceId) {
                await api.put(`/resources/${editResourceId}`, payload);
            } else {
                await api.post('/resources', payload);
            }
            
            setIsManageModalOpen(false);
            setAddName('');
            setAddLocation('');
            setAddCapacity('100');
            fetchResources(); 
        } catch (error) {
            console.error("Failed to manage resource", error);
            alert("Failed to save resource. Check your inputs.");
        } finally {
            setAddLoading(false);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'LECTURE_HALL': return Users;
            case 'LAB': return MonitorPlay;
            case 'MEETING_ROOM': return LayoutDashboard;
            case 'EQUIPMENT': return Settings;
            default: return LayoutDashboard;
        }
    };



    const filteredResources = resources.filter(res => {
        const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || res.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || res.type === filterType;
        const matchesLocation = filterLocation === 'ALL' || res.location === filterLocation;
        const matchesStatus = filterStatus === 'ALL' || res.status === filterStatus;

        let matchesCapacity = true;
        if (filterCapacity !== 'ALL' && res.capacity) {
            if (filterCapacity === 'SMALL') matchesCapacity = res.capacity <= 30;
            else if (filterCapacity === 'MEDIUM') matchesCapacity = res.capacity > 30 && res.capacity <= 100;
            else if (filterCapacity === 'LARGE') matchesCapacity = res.capacity > 100;
        }

        return matchesSearch && matchesType && matchesCapacity && matchesLocation && matchesStatus;
    });


    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Facilities & Assets</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">{resources.length} resources · Occupancy heatmap below</p>
                </div>
                {(userRole === 'ADMIN' || userRole === 'TECHNICIAN') && (
                    <button onClick={handleOpenAdd} className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold shadow-[0_4px_10px_rgba(59,130,246,0.2)] border-b-2 border-blue-600 transition-colors text-[13px]">
                        <span className="mr-1.5">+</span> Add Resource
                    </button>
                )}
            </div>

            {/* Mock Heatmap Panel */}
            <div className="bg-[#181a20] p-6 rounded-2xl border border-[#262832] mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-200 tracking-wide">Hourly Occupancy Heatmap</h3>
                    <div className="flex items-center space-x-2">
                        <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Today</span>
                    </div>
                </div>
                <div className="flex text-[10px] font-bold text-slate-600 uppercase tracking-wider pl-[4.5rem] border-b border-[#262832] pb-2 mb-3">
                    <div className="flex-1 text-center border-l border-[#262832]">8am</div><div className="flex-1 text-center border-l border-[#262832]">9</div><div className="flex-1 text-center border-l border-[#262832]">10</div><div className="flex-1 text-center border-l border-[#262832]">11</div><div className="flex-1 text-center border-l border-[#262832]">12pm</div><div className="flex-1 text-center border-l border-[#262832]">1</div><div className="flex-1 text-center border-l border-[#262832]">2</div><div className="flex-1 text-center border-l border-[#262832]">3</div>
                </div>
                {['LH-301', 'Lab A-12', 'MR-05', 'Lab B-04'].map((room, i) => (
                    <div key={room} className="flex items-center mb-2 h-7 group">
                        <div className="w-[4.5rem] text-[10px] font-bold text-slate-500 pr-4 text-right group-hover:text-slate-300 transition-colors">{room}</div>
                        <div className="flex-1 flex space-x-1 h-full">
                            {[0,1,2,3,4,5,6,7].map(slot => (
                                <div key={slot} className={`flex-1 rounded-sm border border-[#181a20] transition-colors cursor-pointer hover:bg-blue-400 ${(i===1 && slot===3) || (i===2 && slot>4) || (i===3 && slot<2) ? 'bg-[#1e253c]' : 'bg-[#294c8b]'}`}></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar (Filters replaced by pill designs) */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                {[
                    { label: 'All', value: 'ALL' },
                    { label: 'Lecture Halls', value: 'LECTURE_HALL' },
                    { label: 'Labs', value: 'LAB' },
                    { label: 'Meeting Rooms', value: 'MEETING_ROOM' },
                    { label: 'Equipment', value: 'EQUIPMENT' }
                ].map(f => (
                    <button 
                        key={f.value} 
                        onClick={() => setFilterType(f.value)}
                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-colors ${filterType === f.value ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 font-black shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-[#181a20] text-slate-400 border border-[#2b2d38] hover:bg-slate-100 dark:hover:bg-blue-50 dark:bg-[#212533]'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 relative min-h-[400px]">

                {loading && (
                    <div className="absolute inset-0 bg-[#12141a]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {filteredResources.map((res) => {
                    const Icon = getIconForType(res.type);
                    return (
                        <div key={res.id} className="border border-[#262832] rounded-2xl p-6 bg-[#181a20] hover:border-[#3a3d4a] transition-colors relative group flex flex-col h-full shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2 text-slate-300 bg-white/5 p-1.5 rounded-lg">
                                    <Icon className="w-4 h-4 text-amber-500" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">
                                    {res.type.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <h3 className="font-extrabold text-[22px] text-slate-100 mb-1">{res.name}</h3>
                            
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                    <MapPin className="w-3 h-3 text-red-500 mr-1.5" />
                                    {res.location}
                                </div>
                                {res.capacity && (
                                    <div className="flex items-center text-[11px] font-bold text-slate-400">
                                        <Users className="w-[14px] h-[14px] mr-1.5 text-slate-500" />
                                        {res.capacity}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-2 mt-auto">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${res.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-[#2b2d38] text-slate-400 border border-[#3b3d48]'}`}>
                                    {res.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Features list (mocked based on type) from screenshot */}
                            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#262832] items-center">
                                {['AC', res.type === 'EQUIPMENT' ? '4K' : 'Projector', res.type === 'LAB' ? 'PC' : 'WiFi'].map(feature => (
                                    <span key={feature} className="bg-transparent border border-[#2b2d38] text-slate-500 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {feature}
                                    </span>
                                ))}
                                <div className="ml-auto flex gap-2">
                                    {(userRole === 'ADMIN' || userRole === 'TECHNICIAN') && (
                                        <button 
                                            onClick={() => handleOpenEdit(res)}
                                            className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <Link 
                                        to={`/tickets?resourceId=${res.id}`}
                                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                                    >
                                        Report
                                    </Link>
                                    {userRole !== 'ADMIN' && (
                                        <button
                                            onClick={() => handleBookNow(res)}
                                            disabled={res.status !== 'ACTIVE'}
                                            className={`px-3.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${res.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20' : 'bg-transparent text-transparent pointer-events-none'}`}
                                        >
                                            Book
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Manage Resource Modal (Add/Edit) */}
            {isManageModalOpen && (
                <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="flex min-h-full items-start md:items-center justify-center p-2 sm:p-4 text-left">
                        <div className="bg-[#181a20] rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-[#2b2d38] shadow-2xl mt-4 mb-4 md:my-8 m-auto">
                        <div className="px-5 py-4 flex justify-between items-center bg-[#181a20] shrink-0 border-b border-[#262832]">
                            <h3 className="font-extrabold text-[15px] text-white uppercase tracking-widest">
                                {isEditing ? 'Update Resource' : 'Add New Resource'}
                            </h3>
                            <button onClick={() => setIsManageModalOpen(false)} className="bg-[#262832] hover:bg-[#343746] rounded-xl p-1.5 text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 pt-4 bg-[#181a20]">
                            <form onSubmit={submitAddResource} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Name</label>
                                        <input required type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="e.g. LH-302" className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Type</label>
                                        <select required value={addType} onChange={e => setAddType(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium">
                                            <option value="LECTURE_HALL">Lecture Hall</option>
                                            <option value="LAB">Lab</option>
                                            <option value="MEETING_ROOM">Meeting Room</option>
                                            <option value="EQUIPMENT">Equipment</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Capacity</label>
                                        <input required type="number" min="1" value={addCapacity} onChange={e => setAddCapacity(e.target.value)} placeholder="100" className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest">Status</label>
                                        <select required value={addStatus} onChange={e => setAddStatus(e.target.value)} className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium">
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="INACTIVE">INACTIVE</option>
                                            <option value="MAINTENANCE">MAINTENANCE</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Location</label>
                                    <input required type="text" value={addLocation} onChange={e => setAddLocation(e.target.value)} placeholder="e.g. Block A, Floor 3" className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-[13px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors font-medium" />
                                </div>
                                <div className="flex justify-end pt-4 space-x-3">
                                    <button type="button" onClick={() => setIsManageModalOpen(false)} className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-[#262832] text-slate-300 rounded-xl text-[12px] font-bold transition-all">
                                        Cancel
                                    </button>
                                    <button disabled={addLoading} type="submit" className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-[#262832] text-white rounded-xl text-[12px] font-bold shadow-[0_4px_15px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] border border-blue-400/50 transition-all flex items-center justify-center min-w-[124px]">
                                        {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditing ? "Update Resource" : "Add Resource")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {selectedResource && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-[#000000]/80 backdrop-blur-sm">
                    <div className="flex min-h-full items-start md:items-center justify-center p-2 sm:p-4 text-left">
                        <div className="bg-[#181a20] rounded-2xl shadow-2xl border border-[#2b2d38] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-slate-200 mt-4 mb-4 md:my-8 m-auto">
                        <div className="px-5 py-3 border-b border-[#2b2d38] flex justify-between items-center bg-[#1c1e26] shrink-0">
                            <h3 className="font-bold text-[15px] text-slate-100 flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                Reserve Resource
                            </h3>
                            <button onClick={() => setSelectedResource(null)} className="text-slate-400 hover:text-white bg-[#262832] hover:bg-[#343746] rounded-full p-1.5 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-[13px] flex justify-between items-center">
                                <div>
                                    <span className="text-blue-400 font-bold tracking-wide uppercase text-[9px] block mb-0.5">Resource Info</span>
                                    <span className="font-bold text-slate-100 text-[15px] block">{selectedResource.name}</span>
                                </div>
                                <span className="text-slate-400 text-[10px] font-semibold">{selectedResource.location}</span>
                            </div>

                            {bookingSuccess ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-100 mb-2">Booking Requested!</h4>
                                    <p className="text-slate-500 mb-6 text-sm">Your booking request has been submitted for approval.</p>
                                    <button
                                        onClick={() => setSelectedResource(null)}
                                        className="w-full py-2.5 bg-[#262832] text-white rounded-xl font-bold hover:bg-[#323543] transition-colors text-sm uppercase tracking-wider">
                                        Close Window
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={submitBooking} className="space-y-3">
                                    {bookingError && (
                                        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[11px] mb-3 flex items-center font-semibold">
                                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                                            {bookingError}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                                            <input
                                                required type="date" min={new Date().toISOString().split('T')[0]} value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium text-[13px] [color-scheme:dark]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Time</label>
                                            <input
                                                required type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium text-[13px] [color-scheme:dark]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Time</label>
                                            <input
                                                required type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                                className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium text-[13px] [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    {/* 1. Conflict Check UI */}
                                    <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-xl mt-1">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (!bookingDate || !startTime || !endTime) {
                                                    setBookingError("Please fill in date and time first.");
                                                    return;
                                                }
                                                if (startTime >= endTime) {
                                                    setBookingError('End time must be after the start time.');
                                                    return;
                                                }
                                                setBookingError("");
                                                try {
                                                    const res = await api.get('/bookings?status=APPROVED');
                                                    const conflicts = res.data.filter((b: any) => 
                                                        b.resourceId === selectedResource.id && 
                                                        b.date === bookingDate && 
                                                        ((startTime >= b.startTime && startTime < b.endTime) ||
                                                         (endTime > b.startTime && endTime <= b.endTime) ||
                                                         (startTime <= b.startTime && endTime >= b.endTime))
                                                    );
                                                    if (conflicts.length > 0) {
                                                        setBookingError("Conflict detected: This resource is already booked during this time slot.");
                                                    } else {
                                                        alert("Availability Checked: This time slot is perfectly available!");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    setBookingError("Failed to check availability.");
                                                }
                                            }}
                                            className="w-full py-1.5 bg-[#12141a] text-blue-400 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-[#262832] hover:bg-[#1a1c23] transition-colors flex items-center justify-center"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Check Real-time Availability
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Purpose / Description</label>
                                        <textarea
                                            required rows={2} value={purpose} onChange={e => setPurpose(e.target.value)}
                                            placeholder="Why do you need this resource?"
                                            className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium text-[13px] resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Attendees</label>
                                        <input
                                            required type="number" min="1" value={expectedAttendees} onChange={e => setExpectedAttendees(Number(e.target.value))}
                                            placeholder="Number of attendees"
                                            className="w-full px-3 py-2 bg-[#12141a] border border-[#262832] text-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-medium text-[13px]"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={bookingLoading}
                                        className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-[0_4px_10px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center">
                                        {bookingLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : "Confirm Reservation"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
