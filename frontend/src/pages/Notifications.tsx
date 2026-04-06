import { useEffect, useState } from 'react';
import { Check, Folder, MessageSquare, X, Bell } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import api from '../services/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    referenceId?: string;
    referenceType?: string;
    read: boolean;
    createdAt: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            const count = await api.get('/notifications/unread-count');
            setUnreadCount(count.data.count);
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all', {});
            await fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const getIcon = (type: string, read: boolean) => {
        switch (type) {
            case 'BOOKING_APPROVED':
            case 'TICKET_RESOLVED':
                return <Check className={`w-4 h-4 ${read ? 'text-emerald-500/50' : 'text-emerald-500'}`} />;
            case 'BOOKING_REJECTED':
            case 'TICKET_REJECTED':
                return <X className={`w-4 h-4 ${read ? 'text-red-500/50' : 'text-red-500'}`} />;
            case 'TICKET_COMMENT':
            case 'NEW_MESSAGE':
                return <MessageSquare className={`w-4 h-4 ${read ? 'text-slate-500/50' : 'text-slate-400'}`} />;
            case 'TICKET_CREATED':
            case 'TICKET_STATUS_CHANGED':
                return <Folder className={`w-4 h-4 ${read ? 'text-blue-500/50' : 'text-blue-500'}`} />;
            default:
                return <Bell className={`w-4 h-4 ${read ? 'text-blue-500/50' : 'text-blue-500'}`} />;
        }
    };

    const getIconBg = (type: string, read: boolean) => {
        switch (type) {
            case 'BOOKING_APPROVED':
            case 'TICKET_RESOLVED':
                return read ? 'border-emerald-500/10 bg-emerald-500/5' : 'border-emerald-500/20 bg-emerald-500/10';
            case 'BOOKING_REJECTED':
            case 'TICKET_REJECTED':
                return read ? 'border-red-500/10 bg-red-500/5' : 'border-red-500/20 bg-red-500/10';
            case 'TICKET_COMMENT':
            case 'NEW_MESSAGE':
                return read ? 'border-slate-500/10 bg-slate-500/5' : 'border-slate-500/20 bg-slate-500/10';
            default:
                return read ? 'border-blue-500/10 bg-blue-500/5' : 'border-blue-500/20 bg-blue-500/10';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10 text-slate-300 min-h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Notifications</h1>
                    <p className="text-[12px] text-slate-500 mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
                </div>
                <button 
                    onClick={markAllRead}
                    disabled={unreadCount === 0}
                    className="px-5 py-2 mt-4 sm:mt-0 bg-transparent hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed border border-[#262832] text-slate-400 font-bold text-xs rounded-full transition-colors tracking-wide"
                >
                    Mark all read
                </button>
            </div>

            {/* List Container */}
            <div className="bg-[#181a20] border border-[#262832] rounded-2xl overflow-hidden shadow-sm">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                        No notifications
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div 
                            key={n.id}
                            onClick={() => !n.read && markAsRead(n.id)}
                            className={`flex items-start p-5 border-b border-[#262832]/80 transition-colors cursor-pointer group 
                                ${!n.read ? 'bg-[#12141a]/40 hover:bg-[#262832]/30' : 'hover:bg-[#262832]/10'}
                            `}
                        >
                            {/* Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${getIconBg(n.type, n.read)}`}>
                                {getIcon(n.type, n.read)}
                            </div>
                            
                            {/* Content */}
                            <div className="ml-4 flex-1">
                                <p className={`text-[13px] font-medium ${!n.read ? 'text-slate-200' : 'text-slate-400'}`}>
                                    {n.message}
                                </p>
                                <p className={`text-[11px] font-medium mt-1 uppercase tracking-wider ${!n.read ? 'text-slate-500' : 'text-slate-600'}`}>
                                    {n.createdAt ? formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true }) : 'Recently'}
                                </p>
                            </div>
                            
                            {/* Unread dot */}
                            <div className={`ml-4 flex items-center justify-center h-full pt-3 transition-opacity ${n.read ? 'opacity-0' : 'opacity-100'}`}>
                                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
