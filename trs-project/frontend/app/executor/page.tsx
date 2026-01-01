'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { ShieldCheck, TrendingUp, Briefcase, FileText, Users, Scale, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import ExecutorDirectory from '../../components/executor/ExecutorDirectory';
import WalletGuard from '../../components/layout/WalletGuard';

function ExecutorDashboardContent() {
    const { provider, account } = useWallet();

    // Tabs: 'dashboard' | 'directory' | 'governance'
    const [activeTab, setActiveTab] = useState('directory');

    // Dashboard State
    const [reputation, setReputation] = useState<any>(null); // Struct
    const [policyLimit, setPolicyLimit] = useState<string>('0');
    const [activeProjects, setActiveProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider && account) {
            fetchExecutorData();
        }
    }, [provider, account]);

    const fetchExecutorData = async () => {
        try {
            // 1. Fetch Reputation (Correctly reading Struct)
            const repRegistry = new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_REGISTRY, CONTRACT_ABIS.ReputationRegistry, provider);
            // Struct: [exec, report, gov, dispute, isFlagged]
            const repData = await repRegistry.getReputation(account);
            setReputation({
                execution: Number(repData[0]),
                reporting: Number(repData[1]),
                governance: Number(repData[2]),
                dispute: Number(repData[3]),
                isFlagged: repData[4]
            });

            // 2. Fetch Policy Limit
            const polRegistry = new ethers.Contract(CONTRACT_ADDRESSES.POLICY_REGISTRY, CONTRACT_ABIS.PolicyRegistry, provider);
            const limit = await polRegistry.getPolicy("MAX_PROJECT_BUDGET");
            setPolicyLimit(ethers.formatEther(limit));

            // 3. Fetch Active Projects
            const factory = new ethers.Contract(CONTRACT_ADDRESSES.PROJECT_FACTORY, CONTRACT_ABIS.ProjectFactory, provider);
            const filter = factory.filters.ProjectCreated(null, null, account);
            const events = await factory.queryFilter(filter);

            const projects = events.map((e: any) => ({
                address: e.args[0],
                id: e.args[1],
                budget: ethers.formatEther(e.args[3])
            }));
            setActiveProjects(projects);

        } catch (e) {
            console.error("Error fetching executor data", e);
        }
        setLoading(false);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400";
        if (score >= 70) return "text-blue-400";
        if (score >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* HEADER & TABS */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <h1 className="text-4xl font-serif text-white">Executor Hub</h1>

                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'directory' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Users size={16} /> Partner Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Briefcase size={16} /> My Cockpit
                    </button>
                    <button
                        onClick={() => setActiveTab('governance')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'governance' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Scale size={16} /> Official Wallets
                    </button>
                </div>

                <Link href="/proposals/new" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center gap-2 shadow-lg shadow-white/10">
                    Apply as Partner <ExternalLink size={16} />
                </Link>
            </div>

            {/* CONTENT AREA */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                {/* --- TAB: DIRECTORY --- */}
                {activeTab === 'directory' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8 max-w-2xl">
                            <h2 className="text-2xl font-bold text-white mb-2">Verified Partners</h2>
                            <p className="text-gray-400">Trusted entities authorized to execute DAO mandates. Explore their profiles and reputation.</p>
                        </div>
                        <ExecutorDirectory />
                    </div>
                )}

                {/* --- TAB: DASHBOARD --- */}
                {activeTab === 'dashboard' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!account ? (
                            <div className="text-center py-20">
                                <h3 className="text-xl text-gray-400 mb-4">Connect Wallet to view your Operational Cockpit</h3>
                            </div>
                        ) : (
                            <>
                                {/* STATS GRID */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                    {/* EXECUTION SCORE */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Execution Score</div>
                                        <div className={`text-4xl font-mono font-bold ${getScoreColor(reputation?.execution || 0)}`}>
                                            {reputation ? reputation.execution : '-'} <span className="text-sm text-gray-600">/100</span>
                                        </div>
                                        <div className="mt-2 text-xs text-green-400">+5 pts per Milestone</div>
                                    </div>

                                    {/* REPORTING SCORE */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Reporting Score</div>
                                        <div className={`text-4xl font-mono font-bold ${getScoreColor(reputation?.reporting || 0)}`}>
                                            {reputation ? reputation.reporting : '-'} <span className="text-sm text-gray-600">/100</span>
                                        </div>
                                        <div className="mt-2 text-xs text-green-400">+2 pts per Report</div>
                                    </div>

                                    {/* POLICY CAP */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Credit Limit</div>
                                        <div className="text-4xl font-mono font-bold text-blue-400">
                                            {parseInt(policyLimit).toLocaleString()}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400">TRS per Project</div>
                                    </div>

                                    {/* ACTIVE */}
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Active Mandates</div>
                                        <div className="text-4xl font-mono font-bold text-white">
                                            {activeProjects.length}
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400">Processing</div>
                                    </div>
                                </div>

                                {/* ACTIVE PROJECTS TABLE */}
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <FileText size={20} className="text-purple-400" /> Active Assignments
                                </h3>

                                {activeProjects.length === 0 ? (
                                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-gray-500">
                                        No active assignments. <Link href="/proposals/new" className="text-purple-400 hover:underline">Request Mandate</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activeProjects.map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                                <div>
                                                    <div className="font-bold text-white">{p.id}</div>
                                                    <div className="text-xs font-mono text-gray-500">{p.address}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-purple-400 font-bold">{parseInt(p.budget).toLocaleString()} TRS</div>
                                                    <Link href={`/dashboard`} className="text-xs text-white hover:underline opacity-60">Manage in Dashboard</Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* --- TAB: GOVERNANCE --- */}
                {activeTab === 'governance' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Official DAO Architecture</h2>
                            <p className="text-gray-400">Use these addresses to verify all interactions. The DAO will never ask for funds to a different address.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { name: "Timelock Treasury", addr: CONTRACT_ADDRESSES.TIMELOCK, desc: "Holds all DAO assets. 2-Day Delay." },
                                { name: "Dividend Vault", addr: CONTRACT_ADDRESSES.DIVIDEND_VAULT, desc: "Accumulates revenue for Token Holders." },
                                { name: "Reputation Registry", addr: CONTRACT_ADDRESSES.REPUTATION_REGISTRY, desc: "Stores Trust Scores & Policies." },
                                { name: "Project Factory", addr: CONTRACT_ADDRESSES.PROJECT_FACTORY, desc: "Spawns all Escrow contracts." },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition">
                                    <div>
                                        <div className="font-bold text-white text-lg">{item.name}</div>
                                        <div className="text-sm text-gray-400">{item.desc}</div>
                                    </div>
                                    <div className="font-mono text-sm text-purple-400 bg-purple-500/10 px-3 py-1 rounded">
                                        {item.addr}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default function ExecutorDashboardPage() {
    return (
        <WalletGuard>
            <Suspense fallback={<div>Loading...</div>}>
                <ExecutorDashboardContent />
            </Suspense>
        </WalletGuard>
    );
}
