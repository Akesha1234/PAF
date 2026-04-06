import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Clock, MapPin, Users, Settings, Tag, QrCode } from 'lucide-react';
import api from '../services/api';
import type { Resource, BookingRequest, BookingResponse } from '../types';


export default function ResourceDetails() {
    const { id } = useParams();
    const [resource, setResource] = useState<Resource | null>(null);
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [expectedAttendees, setExpectedAttendees] = useState(1);

    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [showQrModal, setShowQrModal] = useState(false);

    const userRole = localStorage.getItem('userRole') || 'USER';

    useEffect(() => {
        if (id) {
            fetchResource();
            fetchBookings();
        }
    }, [id]);

    const fetchResource = async () => {
        try {
            const response = await api.get(`/resources/${id}`);
            setResource(response.data);
        } catch (error) {
            console.error("Failed to fetch resource", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await api.get(`/bookings`);
            const allBookings: BookingResponse[] = response.data;
            const resourceBookings = allBookings.filter(b => b.resourceId === id);
            setBookings(resourceBookings.slice(0, 5)); // Just showing a few upcoming
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resource) return;

        try {
            setBookingLoading(true);
            setBookingError('');

            const payload: BookingRequest = {
                resourceId: resource.id,
                date: bookingDate,
                startTime: startTime,
                endTime: endTime,
                purpose: purpose,
                expectedAttendees: expectedAttendees
            };

            await api.post('/bookings', payload);
            setBookingSuccess(true);
            setBookingDate('');
            setStartTime('');
            setEndTime('');
            setPurpose('');
            fetchBookings(); // Refresh bookings
        } catch (error: any) {
            setBookingError(error.response?.data?.message || 'Failed to create booking.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!resource) {
        return <div className="p-8 text-center text-slate-500">Resource not found.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
            <Link to="/resources" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Catalogue
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{resource.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="inline-flex items-center text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                            <Tag className="w-3.5 h-3.5 mr-1.5" /> {resource.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${resource.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {resource.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {userRole === 'ADMIN' && (
                    <div className="flex gap-3">
                        <button onClick={() => setShowQrModal(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-bold shadow-sm hover:bg-indigo-100 transition-all flex items-center">
                            <QrCode className="w-4 h-4 mr-2" /> Print QR
                        </button>
                        <Link to={`/tickets?resourceId=${resource.id}`} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold shadow-sm hover:bg-emerald-100 transition-all flex items-center">
                            <Wrench className="w-4 h-4 mr-2" /> Report Issue
                        </Link>
                        <Link to="/admin/assets" className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center">
                            <Settings className="w-4 h-4 mr-2" /> Admin Manage
                        </Link>
                    </div>
                )}
                {userRole !== 'ADMIN' && (
                    <Link to={`/tickets?resourceId=${resource.id}`} className="px-5 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold shadow-sm hover:bg-emerald-100 transition-all flex items-center">
                        <Wrench className="w-4 h-4 mr-2" /> Report Issue
                    </Link>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Column - Details & Bookings */}
                <div className="md:col-span-2 space-y-6">
                    {/* Info Card */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-indigo-500" /> Resource Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Location</p>
                                    <p className="font-medium text-slate-900">{resource.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Users className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Capacity</p>
                                    <p className="font-medium text-slate-900">{resource.capacity ? `${resource.capacity} people` : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Clock className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">Availability Windows</p>
                                    <p className="font-medium text-slate-900">{resource.availabilityWindows || 'Standard building hours'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-indigo-500" /> Upcoming Reservations
                        </h3>
                        {bookings.length === 0 ? (
                            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-500">No upcoming bookings for this resource.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map(b => (
                                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div>
                                            <p className="font-bold text-slate-800">{b.date}</p>
                                            <p className="text-sm text-slate-500">{b.startTime} - {b.endTime}</p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {b.status}
                                            </span>
                                            {b.userName && <span className="text-xs text-slate-400 mt-1">by {b.userName}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Booking Form */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Book this Resource</h3>

                        {bookingSuccess ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h4>
                                <p className="text-slate-500 mb-6">Your booking is awaiting admin approval.</p>
                                <button
                                    onClick={() => setBookingSuccess(false)}
                                    className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                                    Book Another Date
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submitBooking} className="space-y-4">
                                {bookingError && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                        {bookingError}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input
                                        required type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                                        <input
                                            required type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                                        <input
                                            required type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Attendees</label>
                                    <input
                                        required type="number" min="1" max={resource.capacity || undefined} value={expectedAttendees} onChange={e => setExpectedAttendees(parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Purpose</label>
                                    <textarea
                                        required rows={3} value={purpose} onChange={e => setPurpose(e.target.value)}
                                        placeholder="Meeting details..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={bookingLoading || resource.status !== 'ACTIVE'}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-all disabled:opacity-70 mt-4 flex items-center justify-center">
                                    {bookingLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : "Submit Booking Request"}
                                </button>
                                {resource.status !== 'ACTIVE' && (
                                    <p className="text-center text-xs text-red-500 font-medium">Resource is out of service.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Equipment QR Print Modal */}
            {showQrModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white rounded-full p-1.5 transition-colors">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><QrCode className="w-8 h-8" /></div>

                        <h3 className="text-xl font-bold text-slate-900 mb-2">Equipment QR Code</h3>
                        <p className="text-sm text-slate-500 mb-6">Scan to directly book this resource.</p>

                        <div className="bg-white border-2 border-slate-100 p-4 rounded-xl inline-block mb-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow" title="Right click to save image">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/resources/' + resource.id)}`} alt="Resource QR" className="w-48 h-48 mix-blend-multiply" />
                        </div>

                        <p className="font-mono text-sm font-bold text-slate-700 tracking-wider uppercase bg-slate-100 rounded-lg px-3 py-2 inline-block mx-auto">{resource.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
