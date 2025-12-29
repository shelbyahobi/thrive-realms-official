'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { ShieldCheck, TrendingUp, AlertTriangle, Briefcase, FileText } from 'lucide-react';

function ExecutorDashboardContent() {
    const { provider, account } = useWallet();

    // State
    const [reputation, setReputation] = useState<number | null>(null);
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
            // 1. Fetch Reputation
            const repRegistry = new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_REGISTRY, CONTRACT_ABIS.ReputationRegistry, provider);
            const score = await repRegistry.getScore(account);
            setReputation(Number(score));

            // 2. Fetch Policy Limit (Max Project Budget)
            const polRegistry = new ethers.Contract(CONTRACT_ADDRESSES.POLICY_REGISTRY, CONTRACT_ABIS.PolicyRegistry, provider);
            const limit = await polRegistry.getPolicy("MAX_PROJECT_BUDGET");
            setPolicyLimit(ethers.formatEther(limit));

            // 3. Fetch Active Projects (This implies an indexer or event logs query)
            // For MVP, we will simulate or query logs if possible.
            // Querying Factory "ProjectCreated" events filtered by executor = account
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

    if (!account) return <div className="p-12 text-center text-gray-400">Please Connect Wallet to View Dashboard</div>;
    if (loading) return <div className="p-12 text-center text-gray-400 animate-pulse">Loading Executor Profile...</div>;

    const getRepColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-4xl font-serif text-white mb-8">Executor Dashboard</h1>

            {/* TOP STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* REPUTATION CARD */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <ShieldCheck size={64} />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Reputation Score</h3>
                    <div className={`text-5xl font-mono font-bold ${getRepColor(reputation || 0)}`}>
                        {reputation !== null ? reputation : 'N/A'}
                        <span className="text-lg text-gray-500 ml-2">/ 100</span>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                        {reputation && reputation >= 80 ? "✅ Eligible for Fast Track" : "⚠️ Standard Governance required"}
                    </div>
                </div>

                {/* POLICY LIMIT CARD */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <TrendingUp size={64} />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Policy Cap</h3>
                    <div className="text-5xl font-mono font-bold text-blue-400">
                        {parseInt(policyLimit).toLocaleString()}
                        <span className="text-lg text-gray-500 ml-2">TRS</span>
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                        Max budget per single project
                    </div>
                </div>

                {/* ACTIVE PROJECTS CARD */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                        <Briefcase size={64} />
                    </div>
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Active Mandates</h3>
                    <div className="text-5xl font-mono font-bold text-white">
                        {activeProjects.length}
                    </div>
                    <div className="mt-4 text-xs text-gray-400">
                        Ongoing executions
                    </div>
                </div>
            </div>

            {/* PROJECTS LIST */}
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><FileText /> Project Portfolio</h2>

            {activeProjects.length === 0 ? (
                <div className="p-12 rounded-xl border border-dashed border-white/20 text-center text-gray-500">
                    No active projects found. Submit a proposal to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {activeProjects.map((p, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{p.id}</h3>
                                <div className="text-sm font-mono text-gray-400">{p.address}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-purple-400">{parseInt(p.budget).toLocaleString()} TRS</div>
                                <div className="text-xs text-green-400">Active</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ExecutorDashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ExecutorDashboardContent />
        </Suspense>
    );
}
