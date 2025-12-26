'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { Building2, ShieldCheck, AlertCircle, CheckCircle, Crown, Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RegisterCompanyPage() {
    const { provider, signer, account } = useWallet();
    const router = useRouter();

    const [name, setName] = useState('');
    const [website, setWebsite] = useState('');
    const [desc, setDesc] = useState('');

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'checking' | 'eligible' | 'ineligible'>('idle');
    const [balance, setBalance] = useState('0');
    const [tierName, setTierName] = useState('None');

    useEffect(() => {
        if (account && provider) {
            checkEligibility();
        }
    }, [account, provider]);

    async function checkEligibility() {
        setStatus('checking');
        const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
        const bal = await token.balanceOf(account);
        const balFormatted = ethers.formatEther(bal);
        const balNum = parseFloat(balFormatted);
        setBalance(balFormatted);

        if (balNum >= 24000) setTierName('Founder');
        else if (balNum >= 12000) setTierName('Voter');
        else if (balNum >= 1200) setTierName('Member');
        else setTierName('None');

        // Requirement: 1200 TRS (Member Tier)
        if (balNum >= 1200) {
            setStatus('eligible');
        } else {
            setStatus('ineligible');
        }
    }

    async function handleRegister() {
        if (!signer || status !== 'eligible') return;
        setLoading(true);

        try {
            const companyRegistry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, signer);
            const metadata = JSON.stringify({ website, description: desc });

            const tx = await companyRegistry.requestRegistration(name, metadata);
            await tx.wait();

            alert("Registration Requested! Redirecting to Proposal Creation...");
            router.push(`/proposals/new?type=company_approval&address=${account}`);
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* HER */}
            <div className="text-center mb-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 transform rotate-3 hover:rotate-0 transition-all">
                    <Building2 className="text-white" size={40} />
                </div>
                <h1 className="text-5xl font-bold text-white mb-4 font-serif">Become an Execution Partner</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Register your entity to execute DAO-funded mandates. Access capital, build reputation, and shape the future of Thrive Realms.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT: BENEFITS & TIERS */}
                <div className="space-y-8">
                    <div className="glass-card p-6 bg-black/40 border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Star className="text-yellow-500" /> Why Register?
                        </h3>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex gap-2">
                                <CheckCircle size={18} className="text-green-400 mt-1" />
                                <span>**Direct Capital Access**: Checked entities are prioritized for Proposal Execution.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={18} className="text-green-400 mt-1" />
                                <span>**On-Chain Reputation**: Build a verifiable track record of successful deliveries.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={18} className="text-green-400 mt-1" />
                                <span>**Global Reach**: Operate across jurisdictions under a Sovereign DAO mandate.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/20">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Crown className="text-purple-400" /> Tier Benefits
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">Your Treasury Reserve Shares (TRS) determine your standing.</p>

                        <div className="space-y-3">
                            <div className={`p-4 rounded-lg border flex justify-between items-center ${tierName === 'Founder' ? 'bg-purple-600/20 border-purple-500' : 'bg-white/5 border-white/10'}`}>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">Founder <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">24k+ TRS</span></div>
                                    <div className="text-xs text-gray-400">Can Create Mandates & Priority Execution</div>
                                </div>
                                {tierName === 'Founder' && <CheckCircle className="text-purple-400" />}
                            </div>

                            <div className={`p-4 rounded-lg border flex justify-between items-center ${tierName === 'Voter' ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/10'}`}>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">Voter <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">12k+ TRS</span></div>
                                    <div className="text-xs text-gray-400">Standard Execution Rights</div>
                                </div>
                                {tierName === 'Voter' && <CheckCircle className="text-blue-400" />}
                            </div>

                            <div className={`p-4 rounded-lg border flex justify-between items-center ${tierName === 'Member' ? 'bg-green-600/20 border-green-500' : 'bg-white/5 border-white/10'}`}>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">Member <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">1.2k+ TRS</span></div>
                                    <div className="text-xs text-gray-400">Minimum Access Requirement</div>
                                </div>
                                {tierName === 'Member' && <CheckCircle className="text-green-400" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: REGISTRATION FORM */}
                <div className="glass-card p-8 bg-black/60 border border-white/10 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <h2 className="text-2xl font-bold text-white mb-6 font-serif z-10 relative">Entity Registration</h2>

                    {/* Eligibility Status */}
                    <div className={`p-4 rounded-lg mb-8 border relative z-10 ${status === 'eligible' ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                        <div className="flex items-center gap-3">
                            {status === 'eligible' ? <CheckCircle className="text-green-400" /> : <AlertCircle className="text-red-400" />}
                            <div>
                                <h3 className={`font-bold ${status === 'eligible' ? 'text-green-400' : 'text-red-400'}`}>
                                    {status === 'eligible' ? 'Access Granted' : 'Access Restricted'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Current Balance: <span className="text-white font-mono">{parseFloat(balance).toLocaleString()} TRS</span>
                                    {status !== 'eligible' && <span className="block mt-1 text-red-300">Minimum 1,200 TRS required.</span>}
                                </p>
                            </div>
                        </div>
                        {status !== 'eligible' && (
                            <a href="/buy" className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors">
                                Buy TRS on Exchange <ArrowRight size={14} />
                            </a>
                        )}
                    </div>

                    <div className="space-y-5 relative z-10">
                        <div>
                            <label className="label-text">Legal Entity Name</label>
                            <input className="input-field" placeholder="e.g. Solar Build GmbH" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="label-text">Website / Portfolio</label>
                            <input className="input-field" placeholder="https://..." value={website} onChange={e => setWebsite(e.target.value)} />
                        </div>
                        <div>
                            <label className="label-text">Capabilities Statement</label>
                            <textarea className="input-field h-32" placeholder="Describe your team, experience, and services..." value={desc} onChange={e => setDesc(e.target.value)} />
                        </div>

                        <div className="bg-yellow-900/10 border border-yellow-500/10 p-4 rounded text-xs text-yellow-500">
                            <strong>Note:</strong> Registration puts you in "Pending" status. You must be approved by a <strong>Governance Vote (&gt;80% Approval)</strong> to become active.
                        </div>

                        <button
                            onClick={handleRegister}
                            disabled={loading || status !== 'eligible'}
                            className={`btn w-full py-4 text-lg font-bold shadow-lg ${status === 'eligible' ? 'btn-primary shadow-purple-500/20' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            {loading ? "Submitting Request..." : "Submit for Dao Review"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
