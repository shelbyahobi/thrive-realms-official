'use client';

import { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Users, Briefcase, Vote, Loader2 } from 'lucide-react';

export default function CommunityStatsWidget() {
    const { provider } = useWallet();
    const [stats, setStats] = useState({
        partners: 0,
        proposals: 0,
        supply: '0'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider) loadStats();
    }, [provider]);

    async function loadStats() {
        try {
            // Contracts
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const governor = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, provider);

            // Parallel Fetch
            const [partners, supply, proposalEvents] = await Promise.all([
                registry.getVerifiedCompanies(),
                token.totalSupply(),
                governor.queryFilter(governor.filters.ProposalCreated()) // Scan all proposal events
            ]);

            setStats({
                partners: partners.length,
                proposals: proposalEvents.length,
                supply: parseFloat(formatEther(supply)).toLocaleString()
            });
        } catch (e) {
            console.error("Failed to load community stats:", e);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="glass-card p-6 flex items-center justify-center h-full min-h-[160px]">
            <Loader2 className="animate-spin text-purple-500" />
        </div>
    );

    return (
        <div className="glass-card p-6 border-l-4 border-emerald-500 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="text-emerald-500" size={20} /> Community Pulse
            </h3>

            <div className="grid grid-cols-3 gap-4">
                {/* Partners */}
                <div className="text-center">
                    <p className="text-3xl font-mono text-white mb-1">{stats.partners}</p>
                    <p className="text-xs text-gray-400 uppercase font-bold flex items-center justify-center gap-1">
                        <Briefcase size={12} /> Partners
                    </p>
                </div>

                {/* Proposals */}
                <div className="text-center border-l border-white/10">
                    <p className="text-3xl font-mono text-white mb-1">{stats.proposals}</p>
                    <p className="text-xs text-gray-400 uppercase font-bold flex items-center justify-center gap-1">
                        <Vote size={12} /> Proposals
                    </p>
                </div>

                {/* Supply */}
                <div className="text-center border-l border-white/10">
                    <p className="text-xl font-mono text-white mb-1 mt-1 font-bold">
                        {parseInt(stats.supply.replace(/,/g, '')) > 900000000
                            ? (parseInt(stats.supply.replace(/,/g, '')) / 1000000000).toFixed(1) + 'B'
                            : (parseInt(stats.supply.replace(/,/g, '')) / 1000000).toFixed(1) + 'M'
                        }
                    </p>
                    <p className="text-xs text-gray-400 uppercase font-bold">Total Supply</p>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-xs text-emerald-500/80 font-bold">● System Operational</p>
            </div>
        </div>
    );
}
