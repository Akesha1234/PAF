import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, Loader2, CheckCircle2 } from 'lucide-react';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isError?: boolean;
};

// Simulated AI Backend for reliable offline presentations and fast usage
const simulateAIResponse = async (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const input = userMessage.toLowerCase();
            if (input.includes('hello') || input.includes('hi ')) {
                resolve("Hello! I'm the Smart Campus AI. I can help you with bookings, facility management, and ticket diagnostics. How can I assist you today?");
            } else if (input.includes('booking') || input.includes('book')) {
                resolve("To manage bookings, please navigate to the 'My Bookings' tab on your dashboard. If you're an Admin, you can review pending requests in the Admin Panel.");
            } else if (input.includes('ticket') || input.includes('issue') || input.includes('broken')) {
                resolve("If you have an issue with a facility, you can raise an open ticket. If it's urgent, please mark it as 'HIGH' priority so our technicians are notified immediately.");
            } else if (input.includes('approval') || input.includes('approve')) {
                resolve("Admin approval is required for Lecturer Halls and specialized equipment. This ensures there are no scheduling conflicts.");
            } else if (input.includes('status') || input.includes('systems')) {
                resolve("All Smart Campus systems are currently fully operational. Local AI simulation is running smoothly at 100% capacity.");
            } else if (input.includes('thank')) {
                resolve("You're very welcome! Let me know if you need anything else.");
            } else {
                resolve("I understand you're asking about '" + userMessage.substring(0, 20) + "...'. Since I'm currently running in Local Presentation Mode, my database is limited. Please try asking about 'bookings', 'tickets', or 'approvals'!");
            }
        }, 1200 + Math.random() * 800); // Simulate network delay 1.2s - 2.0s
    });
};

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [input, setInput] = useState('');

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am your Smart Campus AI assistant. My systems are fully online and ready to help you manage the campus.',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Local fallback AI simulation
            const aiResponseText = await simulateAIResponse(userText);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponseText,
                sender: 'ai',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `System Error: ${error.message}`,
                sender: 'ai',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[550px] bg-[#181a20] border border-[#262832] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    
                    {/* Header */}
                    <div className="px-5 py-4 bg-[#12141a] border-b border-[#262832] flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Bot className="w-4 h-4 text-emerald-400" />
                                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-[#12141a] rounded-full bg-emerald-500`}></span>
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-slate-200 leading-tight flex items-center transition-colors">
                                    Smart Campus AI <Sparkles className="w-3 h-3 text-amber-400 ml-1.5" />
                                </h3>
                                <p className={`text-[10px] font-medium tracking-wider text-emerald-500 flex items-center mt-0.5`}>
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> LOCAL SECURE MODE
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-[#262832] rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#181a20]">
                        <div className="text-center mb-6 flex justify-center items-center gap-2">
                            <div className="h-[1px] bg-[#262832] flex-1"></div>
                            <span className="text-[9px] font-bold text-slate-500 bg-[#12141a] px-3 py-1 rounded-full uppercase tracking-widest border border-[#262832]">
                                Local Simulation Active
                            </span>
                            <div className="h-[1px] bg-[#262832] flex-1"></div>
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'ml-2 bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'mr-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                        {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                    </div>
                                    
                                    {/* Bubble */}
                                    <div className="flex flex-col">
                                        <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                                : msg.isError 
                                                    ? 'bg-red-500/10 text-red-400 rounded-tl-sm border border-red-500/20' 
                                                    : 'bg-[#262832]/60 text-slate-200 rounded-tl-sm border border-[#2b2d38]'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <span className={`text-[9px] font-bold text-slate-500 mt-1 uppercase ${msg.sender === 'user' ? 'text-right mr-1' : 'text-left ml-1'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex w-full justify-start">
                                <div className="flex max-w-[80%] flex-row">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        <Bot className="w-3 h-3" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#262832]/60 border border-[#2b2d38] flex items-center space-x-1 decoration-clone">
                                        <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-emerald-400/50 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#12141a] border-t border-[#262832]">
                        <div className="relative flex items-end">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything..."
                                className="w-full bg-[#181a20] border border-[#2b2d38] text-slate-200 text-[13px] rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-emerald-500/50 hover:border-[#383b4a] transition-colors resize-none custom-scrollbar"
                                rows={1}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 bottom-1.5 p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#262832] disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center justify-center shadow-[0_2px_10px_rgba(16,185,129,0.3)] disabled:shadow-none"
                            >
                                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />}
                            </button>
                        </div>
                        <div className="text-center mt-2.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 flex justify-center items-center">
                            <Sparkles className="w-3 h-3 mr-1 text-slate-500" /> Reliable Sandbox AI Kernel
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative ${
                    isOpen 
                        ? 'bg-[#262832] text-slate-300 hover:bg-[#323544] scale-90' 
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
                }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                 {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#12141a] rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></span>
                )}
            </button>
        </div>
    );
}
