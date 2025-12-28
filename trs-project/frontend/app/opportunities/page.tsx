'use client';

import { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Shield, Lock, Briefcase, Zap, Globe, Sprout, Building, FileText } from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
    const { account, provider } = useWallet();
    const [tier, setTier] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account && provider) {
            checkAccess();
        } else {
            setLoading(false);
        }
    }, [account, provider]);

    async function checkAccess() {
        if (!provider || !account) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const bal = await token.balanceOf(account);
            const balNum = parseFloat(formatEther(bal));

            let t = "Guest";
            if (balNum >= 24000) t = "Founder";
            else if (balNum >= 12000) t = "Voter";
            else if (balNum >= 1200) t = "Member";

            setTier(t);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="p-20 text-center text-gray-500 animate-pulse">Scanning Bio-Signature...</div>;
    }

    // Gated Access View
    if (!account || tier === 'Guest') {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-2xl">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                    <Lock className="mx-auto text-red-400 mb-6" size={48} />
                    <h2 className="text-3xl font-bold text-white mb-4">Classified Clearance Required</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        The Opportunity Intelligence Vault is restricted to <strong>Members, Voters, and Founders</strong>.
                        This registry contains vetted economic opportunities and sensitive execution pipelines.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/" className="px-6 py-2 rounded bg-white/10 hover:bg-white/20 text-white transition">
                            Return Home
                        </Link>
                        {/* Assuming a connect button exists in navbar, triggering it or guiding user might be complex here without global context, 
                            so we just encourage connection via UI */}
                        <div className="px-6 py-2 rounded bg-purple-600 text-white select-none">
                            Connect Wallet to Verify
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5 text-xs text-gray-500">
                        Minimum Requirement: 1,200 TRS (Member Tier)
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Briefcase className="text-emerald-400" size={40} />
                        Opportunity Intelligence Vault
                    </h1>
                    <p className="text-gray-400 max-w-2xl">
                        A governance-curated registry of vetted economic opportunities using the DAO as a verification layer.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                    <Shield className={tier === 'Member' ? 'text-gray-400' : 'text-purple-400'} size={20} />
                    <span className="text-sm text-gray-300">
                        Viewing as <span className="font-bold text-white uppercase">{tier}</span>
                    </span>
                </div>
            </div>

            {/* Access Level Info */}
            {tier === 'Member' && (
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-lg mb-8 flex items-start gap-3">
                    <Lock className="text-blue-400 shrink-0 mt-1" size={16} />
                    <div>
                        <h4 className="text-blue-400 font-bold text-sm">Read-Only Access</h4>
                        <p className="text-xs text-gray-300 mt-1">
                            As a Member, you can view opportunity categories and summaries.
                            Full execution details and voting rights on listings are reserved for Voters and Founders.
                        </p>
                    </div>
                </div>
            )}

            {/* Submission Process Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2">
                    <div className="glass-card p-8 h-full bg-gradient-to-br from-white/5 to-transparent border-white/10">
                        <h3 className="text-xl font-bold text-white mb-6">How It Works</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3 border border-emerald-500/30">1</div>
                                <h4 className="text-white font-bold mb-2">Registration</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Sponsors submit an <strong>Opportunity Registration Proposal</strong> via governance. No direct uploads.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3 border border-blue-500/30">2</div>
                                <h4 className="text-white font-bold mb-2">Vetting</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Founders & Voters diligence the opportunity. Approval lists it here as a "Signal".
                                </p>
                            </div>
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3 border border-purple-500/30">3</div>
                                <h4 className="text-white font-bold mb-2">Funding</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Listing ≠ Funding. Funding requires a separate, subsequent proposal after interest is gauged.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center items-center text-center border-dashed border-2 border-white/10 bg-transparent hover:bg-white/5 transition group">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                        <FileText className="text-gray-400 group-hover:text-white" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Submit Opportunity</h3>
                    <p className="text-xs text-gray-500 mb-6 max-w-xs">
                        Have a vetted deal or SME integration? Submit a registration proposal.
                    </p>
                    <a
                        href="https://github.com/shelbyahobi/thrive-realms-official/blob/main/docs/templates/OPPORTUNITY_REGISTRATION.md"
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-2 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition mb-2"
                    >
                        Get Template
                    </a>
                    <span className="text-[10px] text-gray-600">Requires 1 Founder Sponsor</span>
                </div>
            </div>

            {/* Opportunity Categories (Static MVP) */}
            <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-emerald-500">Active Vault Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <CategoryCard
                    icon={<Sprout size={32} className="text-green-400" />}
                    title="Agriculture & Food Systems"
                    count={0}
                    desc="Regenerative farming, supply chain logistics, and food security projects."
                />

                <CategoryCard
                    icon={<Zap size={32} className="text-yellow-400" />}
                    title="Renewable Energy"
                    count={0}
                    desc="Solar micro-grids, hydro infrastructure, and carbon credit tokenization."
                />

                <CategoryCard
                    icon={<Building size={32} className="text-blue-400" />}
                    title="Real World Assets (RWA)"
                    count={0}
                    desc="Tokenized real estate, heavy machinery, and infrastructure financing."
                />

                <CategoryCard
                    icon={<Globe size={32} className="text-cyan-400" />}
                    title="SME & Emerging Markets"
                    count={0}
                    desc="Small business scaling, verified via local NGO partners."
                />

                <CategoryCard
                    icon={<Shield size={32} className="text-purple-400" />}
                    title="Digital Infrastructure"
                    count={0}
                    desc="DePin networks, connectivity solutions, and local ISP expansion."
                />
            </div>

            <div className="mt-12 p-8 text-center border-t border-white/5">
                <p className="text-gray-500 italic text-sm">
                    "The Vault is empty because we filter for verified value, not noise. Submissions opening soon."
                </p>
            </div>
        </div>
    );
}

function CategoryCard({ icon, title, count, desc }: { icon: any, title: string, count: number, desc: string }) {
    return (
        <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition">
                    {icon}
                </div>
                <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-gray-400 border border-white/5">
                    {count} ACTIVE
                </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">{title}</h4>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 min-h-[40px]">
                {desc}
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-purple-500 transition-all group-hover:w-1/3"></div>
            </div>
        </div>
    )
}
