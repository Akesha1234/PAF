import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Save, X, AlertCircle, Loader2, Building2, MapPin, Users } from 'lucide-react';
import api from '../services/api';
import type { Resource } from '../types';

export default function AdminAssets() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Form Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Resource>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/resources');
            setResources(response.data);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (resource?: Resource) => {
        setIsEditing(!!resource);
        setFormData(resource || {
            name: '',
            type: 'LECTURE_HALL',
            capacity: 20,
            location: '',
            status: 'ACTIVE',
            description: '',
            availabilityWindows: 'MON-FRI 08:00-18:00'
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            type: formData.type,
            capacity: formData.type === 'EQUIPMENT' ? null : (formData.capacity || 1),
            location: formData.location,
            description: formData.description || '',
            availabilityWindows: formData.availabilityWindows || 'MON-FRI 08:00-18:00',
            status: formData.status
        };

        try {
            if (isEditing && formData.id) {
                await api.put(`/resources/${formData.id}`, payload);
            } else {
                await api.post('/resources', payload);
            }
            setSuccess(`Resource ${isEditing ? 'updated' : 'created'} successfully!`);
            setTimeout(() => setSuccess(null), 4000);
            fetchResources();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save resource", err);
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            await api.delete(`/resources/${id}`);
            setResources(prev => prev.filter(r => r.id !== id));
            setSuccess("Asset removed from central inventory.");
            setTimeout(() => setSuccess(null), 4000);
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Delete failed. Asset may be linked to existing bookings.");
        }
    };

    const toggleStatus = async (res: Resource) => {
        try {
            const newStatus = res.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
            await api.patch(`/resources/${res.id}/status`, null, {
                params: { status: newStatus }
            });
            setResources(prev => prev.map(r => r.id === res.id ? { ...r, status: newStatus } : r));
            setSuccess(`Asset marked as ${newStatus.replace('_', ' ')}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to toggle status", err);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-slate-300">
            {/* Success Alerts */}
            {success && (
                <div className="fixed top-8 right-8 z-[10000] animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(37,99,235,0.3)] flex items-center gap-4 border border-blue-400/50">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Infrastructure Update</p>
                            <p className="text-sm font-bold">{success}</p>
                        </div>
                        <button onClick={() => setSuccess(null)} className="ml-4 hover:bg-white/10 p-1 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-[28px] font-black text-white tracking-tight leading-tight">Resources & Assets</h1>
                    <p className="text-[12px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Campus Infrastructure Management</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Asset
                </button>
            </div>

            <div className="bg-[#181a20] rounded-2xl border border-[#262832] shadow-2xl relative min-h-[500px] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-[#262832] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#12141a]/30">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-wider">Campus Inventory</h3>
                    <div className="relative md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Filter by name, type, or location..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#12141a] border border-[#262832] rounded-xl text-[12px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 opacity-50 h-full">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Scanning Records...</span>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-[#12141a]/50 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-[#262832]">
                                <tr>
                                    <th className="px-6 py-4">Resource ID</th>
                                    <th className="px-6 py-4">Name & Classification</th>
                                    <th className="px-6 py-4">Operational Status</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Occupancy</th>
                                    <th className="px-6 py-4 text-right">Managememt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#262832]/80">
                                {resources.map((res) => (
                                    <tr key={res.id} className="hover:bg-[#12141a]/30 transition-all group">
                                         <td className="px-6 py-5 font-mono text-[10px] text-slate-600">
                                            {res.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center border border-[#262832] group-hover:border-blue-500/30 transition-colors">
                                                    <Building2 className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-black text-white">{res.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">{res.type.replace('_', ' ')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                                res.status === 'ACTIVE' 
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${res.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-red-500'}`}></span>
                                                {res.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                                                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                                                {res.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-[12px] font-black text-slate-200">
                                                <Users className="w-3.5 h-3.5 text-slate-600" />
                                                {res.type === 'EQUIPMENT' ? '—' : (res.capacity || 'N/A')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => toggleStatus(res)}
                                                    className={`p-2 rounded-lg border transition-colors ${res.status === 'ACTIVE' ? 'text-amber-500 border-amber-500/20 hover:bg-amber-500/10' : 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'}`}
                                                    title="Mark Out of Service"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleOpenModal(res)} className="p-2 text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(res.id)} className="p-2 text-red-500 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-[#181a20] border border-[#262832] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-[#262832] flex justify-between items-center bg-[#12141a]/50">
                            <div>
                                <h3 className="font-black text-white uppercase tracking-widest text-[11px]">
                                    {isEditing ? 'Resource Modification' : 'Asset Creation'}
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">{isEditing ? 'Updating existing infrastructure' : 'Defining new campus resource'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white bg-[#262832] hover:bg-red-500 transition-all rounded-xl p-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-7 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Resource Title</label>
                                <input
                                    required type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-white text-sm outline-none focus:border-blue-500"
                                    placeholder="e.g. Innovation Lab R4"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
                                    <select
                                        required value={formData.type || ''} onChange={e => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
                                        className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-white text-sm outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                        <option value="LECTURE_HALL">Lecture Hall</option>
                                        <option value="LAB">Lab</option>
                                        <option value="MEETING_ROOM">Meeting Room</option>
                                        <option value="EQUIPMENT">Equipment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Capacity</label>
                                    <input
                                        type="number" value={formData.capacity || ''} onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-white text-sm outline-none focus:border-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Location Identifier</label>
                                <input
                                    required type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-white text-sm outline-none focus:border-blue-500"
                                    placeholder="Building/Room ID"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Operating Hours</label>
                                <input
                                    type="text" value={formData.availabilityWindows || ''} onChange={e => setFormData({ ...formData, availabilityWindows: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#12141a] border border-[#262832] rounded-xl text-white text-sm outline-none focus:border-blue-500"
                                    placeholder="e.g. MON-FRI 08:00-18:00"
                                />
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-[#262832] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abort</button>
                                <button type="submit" className="flex items-center px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all">
                                    <Save className="w-4 h-4 mr-2" strokeWidth={3} /> {isEditing ? 'Apply Changes' : 'Initialize Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

    );
}
