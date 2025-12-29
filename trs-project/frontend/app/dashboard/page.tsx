'use client';

import { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import TokenSale from '../../components/dao/TokenSale';
import DividendDashboard from '../../components/dao/DividendDashboard';
import TreasuryWidget from '../../components/dashboard/TreasuryWidget';
import ActiveProposalsWidget from '../../components/dashboard/ActiveProposalsWidget';
import ActionCenterWidget from '../../components/dashboard/ActionCenterWidget';
import ExecutorStatusWidget from '../../components/dashboard/ExecutorStatusWidget'; // [PHASE 3] New
import PolicyHealthWidget from '../../components/dashboard/PolicyHealthWidget';     // [PHASE 3] New
import FoundingPlaybookWidget from '../../components/dashboard/FoundingPlaybookWidget';
import CommunityStatsWidget from '../../components/dashboard/CommunityStatsWidget';
import { Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { account, provider } = useWallet();
    const [balance, setBalance] = useState('0');
    const [tier, setTier] = useState('Guest');

    useEffect(() => {
        if (account && provider) loadUserData();
    }, [account, provider]);

    async function loadUserData() {
        if (!provider || !account) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const bal = await token.balanceOf(account);
            const balNum = parseFloat(formatEther(bal));
            setBalance(formatEther(bal));

            let t = "Guest";
            if (balNum >= 24000) t = "Founder";
            else if (balNum >= 12000) t = "Voter";
            else if (balNum >= 1200) t = "Member";
            setTier(t);
        } catch (e) { console.error(e); }
    }

    if (!account) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold mb-4">Access Restricted</h2>
                <p className="text-gray-400 mb-8">Please connect your wallet to view your dashboard.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Sparkles className="text-purple-500" />
                Command Center <span className="text-xs bg-white/10 px-2 py-1 rounded text-purple-300">v1.2</span>
            </h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {/* 0. Action Center (Only shows if there are actions) */}
                <div className="md:col-span-2 xl:col-span-3">
                    <ActionCenterWidget />
                </div>

                {/* 0.5 Community Stats */}
                <div className="md:col-span-2 xl:col-span-3">
                    <CommunityStatsWidget />
                </div>

                {/* 1. Balance */}
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Your Balance</p>
                    <p className="text-2xl font-mono text-white truncate" title={balance}>{parseFloat(balance).toLocaleString()} TRS</p>
                </div>

                {/* 2. Executor Status (Unified Reputation) */}
                <ExecutorStatusWidget />

                {/* 2.5 Policy Health (Unified Governance) */}
                <PolicyHealthWidget />

                {/* 2.5 Strategic Playbook */}
                <FoundingPlaybookWidget />

                {/* 3. Opportunity Intelligence Vault (High Visibility) */}
                <div className="glass-card p-6 border-l-4 border-emerald-500 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition"></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Deal Flow</p>
                        <h3 className="text-lg font-bold text-white">Opportunity Vault</h3>
                        <p className="text-xs text-gray-500 mt-2 z-10 relative">
                            Access vetted investment pipelines & submitted mandates.
                        </p>
                    </div>
                    <Link
                        href="/opportunities"
                        className="mt-4 w-full py-2 rounded text-sm font-bold transition flex items-center justify-center gap-2 bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white"
                    >
                        View Intelligence 🟢
                    </Link>
                </div>

                {/* 4. Secure Chat Access */}
                <div className="glass-card p-6 border-l-4 border-indigo-500 flex flex-col justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1">Communication</p>
                        <h3 className="text-lg font-bold text-white">Secure Ops Center</h3>
                        <p className="text-xs text-gray-500 mt-2">
                            Encrypted channels for Founders & Voters.
                        </p>
                    </div>
                    <Link
                        href="/governance/chat"
                        className="mt-4 w-full py-2 rounded text-sm font-bold transition flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        Enter Secure Chat 💬
                    </Link>
                </div>

                {/* 4. Tier */}
                <div className={`glass-card p-6 border-l-4 ${tier === 'Founder' ? 'border-purple-500' : 'border-gray-500'}`}>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Member Tier</p>
                    <div className="flex items-center gap-2">
                        <Shield size={20} className={tier === 'Founder' ? 'text-purple-400' : 'text-gray-400'} />
                        <p className="text-2xl font-bold text-white uppercase">{tier}</p>
                    </div>
                </div>

                {/* 5. Treasury Widget */}
                <TreasuryWidget />

                {/* 6. Proposals Widget */}
                <ActiveProposalsWidget />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Dividends */}
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-white">Dividend Vault</h2>
                        <div className="glass-card p-0 overflow-hidden">
                            <DividendDashboard
                                dividendAddress={CONTRACT_ADDRESSES.DIVIDEND_VAULT}
                                tokenAddress={CONTRACT_ADDRESSES.TOKEN}
                                account={account}
                            />
                        </div>
                    </section>
                </div>

                {/* Right Column: Sale */}
                <div>
                    <TokenSale />
                </div>
            </div>
        </div>
    );
}

