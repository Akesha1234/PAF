import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Timer } from 'lucide-react';

export default function Calendar() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    // Calculate days in the current month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Some arbitrary days with event dots that we pretend carry over
    const eventDays = [8, 10, 15, 18, 22, 25, 29].filter(d => d <= daysInMonth);
    const userName = localStorage.getItem('userName') || 'User';

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const selectedDateString = `${currentMonthName.substring(0, 3)} ${selectedDay}`;
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-full font-sans pb-10 text-slate-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                <div>
                    <h1 className="text-[28px] font-extrabold text-white tracking-tight leading-tight">Booking Calendar</h1>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mt-1">{currentMonthName} {currentYear} — Click a date to book</p>
                </div>
                <button className="px-5 py-2 mt-4 sm:mt-0 bg-[#12141a] hover:bg-white/5 border border-[#262832] text-indigo-400 font-bold text-xs rounded-full transition-colors tracking-wide">
                    New Feature
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                
                {/* Main Calendar View (Left pane) */}
                <div className="flex-1 bg-[#181a20] border border-[#262832] rounded-2xl p-6">
                    {/* Calendar Top Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-black tracking-wider text-slate-100">{currentMonthName} {currentYear}</h2>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="w-8 h-8 rounded-full border border-[#262832] bg-[#12141a] flex items-center justify-center text-slate-400 hover:bg-[#262832] transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="w-8 h-8 rounded-full border border-[#262832] bg-[#12141a] flex items-center justify-center text-slate-400 hover:bg-[#262832] transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid Header */}
                    <div className="grid grid-cols-7 gap-y-4 mb-4">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{day}</div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-y-6">
                        {days.map((day) => {
                            const isSelected = day === selectedDay;
                            const hasEvents = eventDays.includes(day);

                            return (
                                <div key={day} className="flex flex-col items-center justify-start h-14 relative group">
                                    <button 
                                        onClick={() => setSelectedDay(day)}
                                        className={`w-10 h-10 flex items-center justify-center text-[13px] font-bold rounded-2xl transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-blue-500 text-white shadow-[0_4px_15px_rgba(59,130,246,0.4)] scale-110 z-10' 
                                                : 'text-slate-400 hover:text-white hover:bg-[#262832]'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                    
                                    {/* Event Dots Container */}
                                    <div className="h-2 mt-1.5 flex justify-center w-full absolute bottom-0">
                                        {hasEvents && !isSelected && (
                                            <span className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* Details View (Right pane) */}
                <div className="w-full xl:w-96 bg-[#181a20] border border-[#262832] rounded-2xl p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-sm font-bold text-slate-100">Selected: {selectedDateString}</h2>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors tracking-wide">+ Book</button>
                    </div>

                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Bookings on {selectedDateString}</h3>

                    <div className="flex flex-col space-y-3 flex-1">
                        {/* Event Card 1 */}
                        <div className="bg-[#12141a] border border-[#262832] p-4 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-[#2b2e3b] transition-colors cursor-pointer">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <div className="pl-2">
                                <h4 className="text-[12px] font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">Lab A-12 - IT3030 Project</h4>
                                <p className="text-[10px] font-medium text-slate-500">09:00 - 11:00 • {userName}</p>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-blue-400" />
                            </div>
                        </div>

                        {/* Event Card 2 */}
                        <div className="bg-[#12141a] border border-[#262832] p-4 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-[#2b2e3b] transition-colors cursor-pointer">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                            <div className="pl-2">
                                <h4 className="text-[12px] font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">LH-301 - Team Meeting</h4>
                                <p className="text-[10px] font-medium text-slate-500">13:00 - 15:00 • {userName}</p>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                <Timer className="w-2.5 h-2.5 text-amber-500" />
                            </div>
                        </div>

                        {/* Event Card 3 */}
                        <div className="bg-[#12141a] border border-[#262832] p-4 rounded-xl flex items-center justify-between relative overflow-hidden group hover:border-[#2b2e3b] transition-colors cursor-pointer">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <div className="pl-2">
                                <h4 className="text-[12px] font-bold text-slate-200 mb-1 group-hover:text-white transition-colors">PJ-03 - Presentation</h4>
                                <p className="text-[10px] font-medium text-slate-500">15:00 - 16:00 • {userName}</p>
                            </div>
                            <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Free Slots Banner */}
                    <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 py-3 px-4 rounded-xl">
                        <p className="text-[10px] font-bold text-emerald-500">3 slots free today - Peak time: 09:00-15:00</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
