'use client';

import { useState } from 'react';
import { Send, CheckCircle, Briefcase, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';

export default function OpportunityForm() {
    const { signer } = useWallet();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    // Form State
    const [name, setName] = useState('');
    const [country, setCountry] = useState('');
    const [funding, setFunding] = useState('');
    const [contact, setContact] = useState('');
    const [video, setVideo] = useState('');
    const [summary, setSummary] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!signer) {
            alert("Please connect your wallet first!");
            return;
        }

        setStatus('submitting');

        try {
            const vault = new ethers.Contract(
                CONTRACT_ADDRESSES.VAULT,
                CONTRACT_ABIS.OpportunityRegistry,
                signer
            );

            // submitOpportunity(name, country, fundingAsk, contactInfo, ipfsHash)
            // Using JSON for ipfsHash field to pack description + video
            const metadata = JSON.stringify({ summary, video });

            const tx = await vault.submitOpportunity(name, country, funding, contact, metadata);
            await tx.wait();

            setStatus('success');
            // Reset form
            setName(''); setCountry(''); setFunding(''); setContact(''); setVideo(''); setSummary('');
        } catch (error) {
            console.error(error);
            alert("Submission failed. See console.");
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="glass-card p-8 bg-emerald-900/20 border border-emerald-500/30 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-emerald-400">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submission Sent to Intelligent Vault</h3>
                <p className="text-gray-300 text-sm mb-6 max-w-[80%] mx-auto">
                    Your proposal is now in the <strong>"Waiting Room"</strong> for community audit. Once approved by a Local Rep or DAO vote, it will move to the active Funding Round.
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
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
                            value={funding}
                            onChange={(e) => setFunding(e.target.value)}
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
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
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
