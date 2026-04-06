import { Lock, Loader2, Users as UsersIcon, UserPlus, Pencil, Trash2, X, ShieldCheck, Mail, Shield, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

type User = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status?: string;
    provider?: string;
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'USER',
        password: ''
    });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm("CRITICAL: Permanent user removal. All linked records may be affected. Proceed?")) return;
        try {
            await api.delete(`/users/${id}`);
            setSuccess("User identity revoked successfully.");
            setTimeout(() => setSuccess(null), 4000);
            fetchUsers();
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to delete user identifier.");
        }
    };

    const handleOpenModal = (user?: User) => {
        if (user) {
            setIsEditing(true);
            setSelectedUserId(user.id);
            setFormData({
                name: user.fullName || '',
                email: user.email,
                role: user.role,
                password: '' // Don't show password on edit
            });
        } else {
            setIsEditing(false);
            setSelectedUserId(null);
            setFormData({
                name: '',
                email: '',
                role: 'USER',
                password: 'password123'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && selectedUserId) {
                await api.patch(`/users/${selectedUserId}`, {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email
                });
                setSuccess("Access privileges updated.");
            } else {
                await api.post('/users/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                });
                setSuccess("New campus identity initialized.");
            }
            setTimeout(() => setSuccess(null), 4000);
            setIsModalOpen(false);
            fetchUsers();
        } catch (e: any) {
            console.error(e);
            alert(e.response?.data?.message || "Operational failure during identity processing.");
        }
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const getRoleStyles = (role: string) => {
        switch(role) {
            case 'ADMIN': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'TECHNICIAN': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getAvatarStyles = (role: string) => {
        switch(role) {
            case 'ADMIN': return 'bg-red-500/10 border-red-500/20 text-red-500';
            case 'TECHNICIAN': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
            default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10 text-slate-300 min-h-full">
            {/* Notifications */}
            {success && (
                <div className="fixed top-8 right-8 z-[10000] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] flex items-center gap-4 border border-blue-400/50">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Security Update</p>
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="ml-4 hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">User Management</h1>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{users.length} registered campus identities</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="mt-4 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest py-2.5 px-6 rounded-xl transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] border border-blue-400/30"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-[#181a20] border border-[#262832] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-x-auto custom-scrollbar min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-50 h-full">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Scanning Registry...</span>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 opacity-30 h-full">
                        <UsersIcon className="w-12 h-12 text-slate-500 mb-4" />
                        <span className="text-sm font-bold tracking-widest text-slate-400 uppercase">Empty Registry</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#262832]/80 bg-[#12141a]/60">
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Identity</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Contact Channel</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Clearance Role</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Authentication</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">Activity</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans text-right">Operational Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262832]/50">
                            {users.map((user, i) => {
                                const isGoogle = user.provider === 'google';
                                const initials = getInitials(user.fullName);
                                const displayId = user.id ? user.id.substring(0, 8).toUpperCase() : 'UNKNOWN';
                                
                                return (
                                    <tr key={i} className="hover:bg-[#12141a]/40 transition-colors group">
                                        <td className="py-5 px-6">
                                            <div className="flex items-center">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 border ${getAvatarStyles(user.role)} shadow-inner`}>
                                                    {initials}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-[14px] font-black text-slate-100">{user.fullName}</p>
                                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5 font-mono">ID: {displayId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[12px] text-slate-400 font-medium">{user.email}</td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center text-[9px] font-black border px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm ${getRoleStyles(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center text-[11px] font-bold text-slate-400">
                                                {isGoogle ? (
                                                    <span className="flex items-center text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
                                                        Cloud SSO
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-slate-500">
                                                        <Lock className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                                                        Local Auth
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${user.status === 'AWAY' ? 'text-slate-600' : 'text-emerald-500'}`}>
                                                <span className={`w-1 h-1 rounded-full ${user.status === 'AWAY' ? 'bg-slate-700' : 'bg-emerald-500'}`}></span>
                                                {user.status || 'Active Now'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleOpenModal(user)}
                                                    className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all border border-transparent hover:border-amber-500/20 shadow-none hover:shadow-lg"
                                                    title="Modify Access"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20 shadow-none hover:shadow-lg"
                                                    title="Revoke Identity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Management Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] border border-[#2b2d38] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.8)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 flex justify-between items-center bg-[#12141a]/80 border-b border-[#2b2d38]">
                            <div>
                                <h3 className="font-black text-[13px] text-white uppercase tracking-[0.2em]">
                                    {isEditing ? 'Access Modification' : 'New Identity Initialization'}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Campus Security Control</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-[#262832] hover:bg-red-500/20 hover:text-red-500 p-2 rounded-xl transition-all text-slate-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveUser} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Full Legal Name</label>
                                    <div className="relative">
                                        <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input 
                                            required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-[#12141a] border border-[#262832] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                            placeholder="e.g. Alexander Pierce"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Campus Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                        <input 
                                            required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-[#12141a] border border-[#262832] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                            placeholder="alexander@campus.edu"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Authentication Role</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                            <select 
                                                required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                                                className="w-full bg-[#12141a] border border-[#262832] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium appearance-none cursor-pointer"
                                            >
                                                <option value="USER">Student / Staff</option>
                                                <option value="TECHNICIAN">Maintenance Crew</option>
                                                <option value="ADMIN">System Overseer</option>
                                            </select>
                                        </div>
                                    </div>
                                    {!isEditing && (
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 px-1">Access Key</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                                <input 
                                                    required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                                                    className="w-full bg-[#12141a] border border-[#262832] rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-medium"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-[#262832]">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort</button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest px-8 py-3 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all border border-blue-400/30"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditing ? 'Authorize Updates' : 'Initialize Identity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
