'use client';

import { useState } from 'react';
import { Send, CheckCircle, Briefcase, MapPin, DollarSign } from 'lucide-react';

export default function OpportunityForm() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    if (status === 'success') {
        return (
            <div className="glass-card p-8 bg-emerald-900/20 border border-emerald-500/30 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submission Received!</h3>
                <p className="text-gray-300 text-sm mb-6">
                    Our governance team checks new submissions every 48 hours. Keep an eye on the "Signals" section.
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="text-emerald-400 hover:text-emerald-300 text-sm underline"
                >
                    Submit another opportunity
                </button>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 bg-gradient-to-br from-gray-900 to-black border-white/10 h-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
                    <Send size={20} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Submit New Opportunity</h3>
                    <p className="text-xs text-gray-500">Direct Proposal Entry • No Gas Fees</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block flex items-center gap-2">
                        <Briefcase size={10} /> Business Name
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Lagos Solar Agri-Co"
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block flex items-center gap-2">
                            <MapPin size={10} /> Country
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Nigeria"
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block flex items-center gap-2">
                            <DollarSign size={10} /> Funding Ask
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. $5,000"
                            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block flex items-center gap-2">
                        <span className="text-green-400">📱</span> WhatsApp / Direct Contact
                    </label>
                    <input
                        required
                        type="tel"
                        placeholder="+234..."
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">
                        Impact Summary (The "Why")
                    </label>
                    <textarea
                        required
                        rows={3}
                        placeholder="Describe what you do and how it helps the local community..."
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition resize-none"
                    ></textarea>
                </div>

                <div>
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block flex items-center gap-2">
                        <span className="text-red-400">▶</span> Video Pitch (Optional)
                    </label>
                    <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        Paste a link to a 60-second video tour of your business. Highly recommended.
                    </p>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 rounded transition flex items-center justify-center gap-2"
                    >
                        {status === 'submitting' ? 'Transmitting...' : 'Submit to DAO Registry'}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center mt-2">
                        By submitting, you agree to our transparent verification process.
                    </p>
                </div>
            </form>
        </div>
    );
}
