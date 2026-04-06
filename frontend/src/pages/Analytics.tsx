import { BarChart3, Clock, Target, Wrench } from 'lucide-react';

export default function Analytics() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full font-sans pb-10 text-slate-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Analytics Dashboard</h1>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">Resource utilization, booking trends, SLA metrics</p>
                </div>
                <button className="px-5 py-2 mt-4 sm:mt-0 bg-[#12141a] hover:bg-white/5 border border-[#262832] text-indigo-400 font-bold text-xs rounded-full transition-colors tracking-wide">
                    New Feature
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card 1 */}
                <div className="bg-[#181a20] border-t-2 border-t-emerald-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-white mb-1 tracking-tight">89%</div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Avg Utilization</div>
                    <div className="text-[10px] font-bold text-emerald-500 flex items-center">
                        <span className="mr-1">▲</span> 4% this week
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-[#181a20] border-t-2 border-t-blue-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-white mb-1 tracking-tight">2.4h</div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Avg Booking Duration</div>
                    <div className="text-[10px] font-bold text-emerald-500 flex items-center">
                        Optimal range
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-[#181a20] border-t-2 border-t-amber-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <Target className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-white mb-1 tracking-tight">94%</div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Approval Rate</div>
                    <div className="text-[10px] font-bold text-emerald-500 flex items-center">
                        <span className="mr-1">▲</span> 2% vs last month
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-[#181a20] border-t-2 border-t-red-500 border border-[#262832] rounded-xl p-5 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <Wrench className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <div className="text-2xl font-black text-white mb-1 tracking-tight">4.2h</div>
                    <div className="text-[11px] font-semibold text-slate-500 mb-2">Avg Resolution Time</div>
                    <div className="text-[10px] font-bold text-red-500 flex items-center">
                        <span className="mr-1">▼</span> High priority tickets
                    </div>
                </div>
            </div>

            {/* Middle Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Left: Weekly Booking Volume */}
                <div className="lg:col-span-2 bg-[#181a20] border border-[#262832] rounded-xl p-5">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200 mb-6">Weekly Booking Volume</h3>
                    {/* Mocked Bar Chart area relative positioning */}
                    <div className="relative h-48 w-full flex items-end justify-between gap-1 pb-6 mt-4">
                        {/* Bars */}
                        <div className="w-full flex justify-between h-full items-end gap-1">
                            <div className="w-full bg-[#3b82f6] hover:bg-blue-400 transition-colors rounded-sm h-[40%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Mon</span>
                            </div>
                            <div className="w-full bg-[#3b82f6] hover:bg-blue-400 transition-colors rounded-sm h-[60%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Tue</span>
                            </div>
                            <div className="w-full bg-[#3b82f6] hover:bg-blue-400 transition-colors rounded-sm h-[45%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Wed</span>
                            </div>
                            <div className="w-full bg-[#3b82f6] hover:bg-blue-400 transition-colors rounded-sm h-[90%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Thu</span>
                            </div>
                            <div className="w-full bg-[#3b82f6] hover:bg-blue-400 transition-colors rounded-sm h-[80%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Fri</span>
                            </div>
                            <div className="w-full bg-amber-500 hover:bg-amber-400 transition-colors rounded-sm h-[35%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Sat</span>
                            </div>
                            <div className="w-full bg-slate-500 hover:bg-slate-400 transition-colors rounded-sm h-[20%] relative group">
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">Sun</span>
                            </div>
                        </div>
                        {/* Hidden faint horizontal guide lines can be simulated here if needed */}
                        <div className="absolute top-0 w-full border-b border-[#262832]/50"></div>
                        <div className="absolute top-1/2 w-full border-b border-[#262832]/50"></div>
                    </div>
                </div>

                {/* Right: Resource Type Distribution */}
                <div className="lg:col-span-1 bg-[#181a20] border border-[#262832] rounded-xl p-5 flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200 mb-6">Resource Type Distribution</h3>
                    
                    <div className="flex-1 flex items-center justify-between mt-2">
                        {/* Mock SVG Doughnut Chart */}
                        <div className="relative w-28 h-28 flex-shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90 drop-shadow-lg">
                                {/* Background circle (empty) */}
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#262832" strokeWidth="4"></circle>
                                
                                {/* Segment: Lecture Halls (Blue) - 63% */}
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="63 100" strokeDashoffset="0"></circle>
                                
                                {/* Segment: Labs (Green) - 15% (39% of remaining) */}
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-63"></circle>
                                
                                {/* Segment: Meeting Rooms (Orange) - 15% */}
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-78"></circle>

                                {/* Segment: Equipment (Red) - 7% */}
                                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="7 100" strokeDashoffset="-93"></circle>
                            </svg>
                            {/* Inner Circle Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-black text-white leading-none">127</span>
                                <span className="text-[8px] font-bold text-slate-500 uppercase">Bookings</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col space-y-3 flex-1 pl-6">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 mr-2 rounded-sm bg-blue-500"></span>
                                    Lecture Halls
                                </div>
                                <span className="text-white">63%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 mr-2 rounded-sm bg-emerald-500"></span>
                                    Labs
                                </div>
                                <span className="text-white">39%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 mr-2 rounded-sm bg-amber-500"></span>
                                    Meeting Rooms
                                </div>
                                <span className="text-white">24%</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <div className="flex items-center text-slate-400">
                                    <span className="w-2 h-2 mr-2 rounded-sm bg-red-500"></span>
                                    Equipment
                                </div>
                                <span className="text-white">16%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bg-[#181a20] border border-[#262832] rounded-xl p-5 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-200 mb-6">Top Resources by Booking Count</h3>
                
                <div className="flex flex-col space-y-5">
                    {/* Item 1 */}
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0">LH-301</span>
                        <div className="flex-1 ml-2 mr-4 bg-[#12141a] h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-blue-500 w-6 text-right">34</span>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0">Lab A-12</span>
                        <div className="flex-1 ml-2 mr-4 bg-[#12141a] h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-500 w-6 text-right">29</span>
                    </div>
                    {/* Item 3 */}
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0">MR-05</span>
                        <div className="flex-1 ml-2 mr-4 bg-[#12141a] h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '55%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-amber-500 w-6 text-right">22</span>
                    </div>
                    {/* Item 4 */}
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0">Lab B-04</span>
                        <div className="flex-1 ml-2 mr-4 bg-[#12141a] h-2 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-purple-500 w-6 text-right">19</span>
                    </div>
                    {/* Item 5 */}
                    <div className="flex items-center">
                        <span className="text-[10px] font-bold text-slate-400 w-20 flex-shrink-0">LH-105</span>
                        <div className="flex-1 ml-2 mr-4 bg-[#12141a] h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-[11px] font-black text-red-500 w-6 text-right">15</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
