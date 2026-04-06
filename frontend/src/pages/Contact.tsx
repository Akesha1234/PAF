import { MapPin, Mail, Phone, Clock, ChevronRight, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Contact() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Hero */}
            <div className="relative pt-32 pb-20 justify-center bg-slate-900">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/30 blur-3xl opacity-50 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom-4">Get in touch</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-6 delay-100">
                        Have questions about implementation? We're here to help.
                    </p>
                    <Link to="/" className="inline-flex items-center text-indigo-300 hover:text-indigo-100 font-bold transition-colors">
                        Back to Home <ChevronRight className="w-5 h-5 ml-1" />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">

                    {/* Contact Info (Left Side) */}
                    <div className="lg:w-2/5 md:bg-gradient-to-br from-indigo-900 to-slate-900 bg-indigo-900 p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

                        <h3 className="text-3xl font-bold mb-8 relative z-10 text-white">Contact Information</h3>
                        <p className="text-indigo-200 mb-12 text-lg relative z-10">Fill up the form and our Team will get back to you within 24 hours.</p>

                        <div className="space-y-8 relative z-10 text-lg">
                            <div className="flex items-center gap-4">
                                <Phone className="text-indigo-300 w-6 h-6" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Mail className="text-indigo-300 w-6 h-6" />
                                <span>support@smartcampus.edu</span>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="text-indigo-300 w-6 h-6 mt-1" />
                                <span>101 Innovation Drive<br />Tech Park, TP 90210</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Clock className="text-indigo-300 w-6 h-6" />
                                <span>Mon - Fri, 8:00 AM - 6:00 PM</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form (Right Side) */}
                    <div className="lg:w-3/5 p-12 lg:p-16">
                        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">First Name</label>
                                    <input type="text" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent text-slate-800 font-medium" placeholder="Jane" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Last Name</label>
                                    <input type="text" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent text-slate-800 font-medium" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Email</label>
                                    <input type="email" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent text-slate-800 font-medium" placeholder="jane@university.edu" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Phone</label>
                                    <input type="text" className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent text-slate-800 font-medium" placeholder="(555) 000-0000" />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <label className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Message</label>
                                <textarea className="w-full border-b-2 border-slate-200 py-2 focus:outline-none focus:border-indigo-600 transition-colors bg-transparent h-24 resize-none text-slate-800 font-medium" placeholder="How can we help you?"></textarea>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="inline-flex items-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 hover:-translate-y-0.5 transition-all">
                                    Send Message <Send className="ml-2 w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
