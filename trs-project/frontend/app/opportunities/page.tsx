'use client';

import { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Shield, Lock, Briefcase, Zap, Globe, Sprout, Building, FileText, MapPin, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import OpportunityForm from '../../components/opportunities/OpportunityForm';
import SuccessCarousel from '../../components/opportunities/SuccessCarousel';

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

    // Public View (Ungated) - Educational Content is visible to everyone
    // We only gate specific actions or sensitive data lists

    return (
        <div className="container mx-auto px-4 py-12">

            {/* Header - Mission First */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <Globe className="text-emerald-400" size={40} />
                        Opportunities with Purpose
                    </h1>
                    <p className="text-gray-400 max-w-2xl font-light text-lg">
                        Funding community-led businesses that improve livelihoods, financial independence, and local resilience in underserved regions.
                    </p>
                    <p className="text-xs text-gray-500 mt-2 border-l-2 border-emerald-500/30 pl-3">
                        Thrive Realm prioritizes real economic activity in regions where access to capital is limited, enabling local representatives to build sustainable businesses with global transparency.
                    </p>
                </div>
                {account && (
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                        <Shield className={tier === 'Member' ? 'text-gray-400' : 'text-purple-400'} size={20} />
                        <span className="text-sm text-gray-300">
                            Viewing as <span className="font-bold text-white uppercase">{tier}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Guest Banner */}
            {(!account || tier === 'Guest') && (
                <div className="bg-gradient-to-r from-emerald-900/40 to-black border border-emerald-500/30 p-6 rounded-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Lock size={20} className="text-emerald-400" />
                            Impact Capital Access
                        </h3>
                        <p className="text-gray-300 mb-6 max-w-3xl">
                            Welcome to the Hub. You are viewing the public version.
                            To vote on deals or access full due diligence reports on our Community Anchors, please connect your wallet.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-emerald-200 font-mono bg-black/40 px-4 py-2 rounded inline-block">
                            &gt; Waiting for Connect...
                        </div>
                    </div>
                </div>
            )}

            {/* Featured Community Anchor (New Section) */}
            <div className="mb-12">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Featured Community Anchor</h3>
                <div className="glass-card p-6 border border-white/10 bg-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                                LK
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg">Lagos Agri-Cooperative</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <MapPin size={10} /> Lagos, Nigeria
                                    <span className="text-emerald-400 flex items-center gap-1 border border-emerald-500/30 px-1 rounded bg-emerald-500/10">
                                        <CheckCircle size={8} /> Wallet Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm italic mb-4">
                            "We organize 50+ smallholder farmers to pool resources for fertilizer and mechanized tools. Our goal is 100% local ownership within 3 years."
                        </p>
                        <div className="flex gap-4 text-xs font-mono">
                            <div className="bg-black/40 px-3 py-1 rounded">
                                <span className="text-gray-500 block">IMPACT</span>
                                <span className="text-white text-lg">200+</span> Households
                            </div>
                            <div className="bg-black/40 px-3 py-1 rounded">
                                <span className="text-gray-500 block">ROLE</span>
                                <span className="text-amber-400">Co-op Leader</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right hidden md:block border-l border-white/10 pl-6 h-full">
                        <h5 className="text-gray-500 text-xs uppercase mb-1">Current Ask</h5>
                        <p className="text-2xl font-bold text-white mb-1">$12,000</p>
                        <p className="text-xs text-emerald-400 mb-4">For Solar Irrigation Pump</p>
                        <button className="text-xs bg-white text-black font-bold px-3 py-1 rounded hover:bg-gray-200 transition">
                            View Proposal &rarr;
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

                {/* Left: Success Carousel & Local Rep */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Success Stories Carousel */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Recent Wins</h3>
                        <SuccessCarousel />
                    </div>

                    {/* Investment Mandate & Local Rep */}
                    <div className="glass-card p-8 bg-gradient-to-br from-white/5 to-transparent border-white/10">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">Investment Mandate (Phase 1)</h3>
                            <button className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded border border-white/10 transition">
                                View Full Policy
                            </button>
                        </div>

                        <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                            Thrive Realm prioritizes projects in low-income and emerging regions where access to capital is structurally limited.
                        </p>

                        <h4 className="text-sm font-bold text-white mb-2">Priority Regions:</h4>
                        <ul className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-6">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Sub-Saharan Africa</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> South Asia</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Latin America</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> MENA Region</li>
                        </ul>

                        {/* Local Rep Teaser */}
                        <div className="bg-gradient-to-r from-purple-900/40 to-black p-4 rounded-lg flex items-center justify-between border border-purple-500/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">Need help applying?</h4>
                                    <p className="text-[10px] text-gray-400">Talk to a Verified Local Ambassador in your language.</p>
                                </div>
                            </div>
                            <button className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded transition">
                                Find Rep
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: The New Form */}
                <OpportunityForm />
            </div>

            {/* Opportunity Classes */}
            <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-emerald-500">Impact Opportunity Classes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <CategoryCard
                    icon={<Sprout size={32} className="text-green-400" />}
                    title="Community Agriculture"
                    roi="Hybrid (Social + 5%)"
                    budget="$2k - $15k"
                    desc="Regenerative farming, food security, and cooperative supply chains."
                />

                <CategoryCard
                    icon={<Zap size={32} className="text-yellow-400" />}
                    title="Energy Access"
                    roi="Financial (8-12%)"
                    budget="$10k - $50k"
                    desc="Solar micro-grids and clean energy infrastructure for off-grid communities."
                />

                <CategoryCard
                    icon={<Building size={32} className="text-blue-400" />}
                    title="Affordable Housing"
                    roi="Social (Low Yield)"
                    budget="$20k - $100k"
                    desc="Sustainable local construction using local materials and labor."
                />

                <CategoryCard
                    icon={<Globe size={32} className="text-cyan-400" />}
                    title="Water & Sanitation"
                    roi="Social Impact"
                    budget="$1k - $10k"
                    desc="Clean water boreholes, irrigation, and waste management systems."
                />

                <CategoryCard
                    icon={<Briefcase size={32} className="text-purple-400" />}
                    title="Local Manufacturing"
                    roi="Financial (High Yield)"
                    budget="$5k - $25k"
                    desc="SME scaling, machinery acquisition, and craft cooperatives."
                />
            </div>

            <div className="mt-12 p-8 text-center border-t border-white/5">
                <p className="text-gray-500 italic text-sm mb-4">
                    "Capital goes where it is invited, but stays where it is treated well."
                </p>
                <Link href="/opportunities/lite" className="text-xs text-gray-600 hover:text-gray-400 underline">
                    Switch to Low-Data Mode (Lite Version)
                </Link>
            </div>
        </div>
    );
}

function CategoryCard({ icon, title, roi, budget, desc }: { icon: any, title: string, roi: string, budget: string, desc: string }) {
    return (
        <div className="glass-card p-6 border border-white/5 hover:border-white/10 transition group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-white/5 p-3 rounded-lg group-hover:bg-white/10 transition">
                    {icon}
                </div>
                <div className="text-right">
                    <span className="block text-[10px] text-gray-500 uppercase">Target ROI</span>
                    <span className="text-xs font-mono text-emerald-400">
                        {roi}
                    </span>
                </div>
            </div>
            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition">{title}</h4>
            <div className="text-xs text-gray-500 mb-2 font-mono">
                Budget: <span className="text-gray-300">{budget}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4 min-h-[40px]">
                {desc}
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-0 h-full bg-emerald-500 transition-all group-hover:w-1/3"></div>
            </div>
        </div>
    )
}
