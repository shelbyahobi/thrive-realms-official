"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';
import { KPICard } from '@/components/transparency/KPICard';
import { ProjectTable } from '@/components/transparency/ProjectTable';
import { ArrowLeft } from 'lucide-react';

export default function TransparencyPage() {
    const [treasuryBalance, setTreasuryBalance] = useState('0.00');

    useEffect(() => {
        async function fetchTreasury() {
            if (typeof window.ethereum === 'undefined') return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(CONTRACT_ADDRESSES.TIMELOCK);
            setTreasuryBalance(formatEther(balance));
        }
        fetchTreasury();
    }, []);

    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="flex flex-col gap-4 mb-12">
                    <Link href="/" className="text-gray-500 hover:text-white flex items-center gap-2 text-sm w-fit transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                            Institutional Transparency
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl">
                            Real-time, immutable oversight of the Thrive Realm treasury, governance, and project execution.
                        </p>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <KPICard
                        title="Common Treasury"
                        value={`${treasuryBalance} BNB`}
                        sub="Verified On-Chain"
                        icon="Wallet"
                        color="purple"
                    />
                    <KPICard
                        title="Active Governance"
                        value="3 Proposals"
                        sub="98% Participation"
                        icon="Vote"
                        color="blue"
                    />
                    <KPICard
                        title="Verified Projects"
                        value="1 Active"
                        sub="Fully Doxxed"
                        icon="Shield"
                        color="emerald"
                    />
                    <KPICard
                        title="Reporting Compliance"
                        value="100%"
                        sub="Last 30 Days"
                        icon="Check"
                        color="pink"
                    />
                </div>

                {/* Execution Ledger */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Execution Ledger</h2>
                            <p className="text-gray-400 text-sm">Live tracking of all funded projects and their delivery status.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/reports" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors">
                                Submit Report
                            </Link>
                        </div>
                    </div>

                    <ProjectTable />
                </div>

                {/* Policy Links */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <a href="#" className="block p-6 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group">
                        <h3 className="text-white font-bold mb-2 group-hover:text-purple-400">Communications Policy</h3>
                        <p className="text-gray-500 text-sm">Standards for official DAO communications.</p>
                    </a>
                    <a href="#" className="block p-6 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group">
                        <h3 className="text-white font-bold mb-2 group-hover:text-purple-400">Founder Disclosures</h3>
                        <p className="text-gray-500 text-sm">Conflict of interest & token allocation transparency.</p>
                    </a>
                    <a href="#" className="block p-6 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/5 transition-all group">
                        <h3 className="text-white font-bold mb-2 group-hover:text-purple-400">Rejected Archive</h3>
                        <p className="text-gray-500 text-sm">History of declined proposals and reasons.</p>
                    </a>
                </div>

            </div>
        </main>
    );
}
