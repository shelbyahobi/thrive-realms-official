'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Shield, ShieldCheck, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function ExecutorStatusWidget() {
    const { account, provider } = useWallet();
    const [reputation, setReputation] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account && provider) checkReputation();
    }, [account, provider]);

    async function checkReputation() {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_REGISTRY, CONTRACT_ABIS.ReputationRegistry, provider);
            const score = await registry.getScore(account);
            setReputation(Number(score));

            // [Phase 4] Check Entity Type from ExecutionRegistry
            const execReg = new ethers.Contract(CONTRACT_ADDRESSES.EXECUTION_REGISTRY, CONTRACT_ABIS.ExecutionRegistry, provider);
            const profile = await execReg.getEntity(account);
            // EntityType enum: 0=UNKNOWN, 1=STANDARD, 2=FIAT_BRIDGE, 3=EXECUTION_POD
            const types = ["Unknown", "Standard Entity", "Fiat Bridge", "Execution Pod"];
            setEntityType(types[Number(profile.entityType)] || "Unknown");

        } catch (e) {
            console.error("Error fetching status", e);
            setReputation(0);
        }
        setLoading(false);
    }

    // [Phase 4] Add state
    const [entityType, setEntityType] = useState<string>('');

    if (!account) return null; // Don't show if not connected

    if (loading) return <div className="glass-card p-6 h-full animate-pulse bg-white/5"></div>;

    const isFastTrack = reputation !== null && reputation >= 80;

    return (
        <div className={`glass-card p-6 h-full flex flex-col justify-between border-l-4 ${isFastTrack ? 'border-orange-500' : 'border-purple-500'} group`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isFastTrack ? 'bg-orange-500/10' : 'bg-purple-500/10'}`}>
                    {isFastTrack ? <TrendingUp className="text-orange-400" size={24} /> :
                        <Shield className="text-purple-400" size={24} />}
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Execution Status</span>
                    <span className="text-xs font-mono text-purple-300">{entityType !== "Unknown" ? entityType : "Guest"}</span>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-1">
                    {reputation !== null ? reputation : 0} <span className="text-sm font-normal text-gray-500">/ 100</span>
                </h3>
                <div className={`flex items-center gap-2 text-sm font-bold ${isFastTrack ? 'text-orange-400' : 'text-purple-400'}`}>
                    {isFastTrack ? '⚡ Fast Track Enabled' : '🛡️ Standard Governance'}
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
                <Link href="/executor" className={`text-sm flex items-center gap-1 font-bold hover:underline ${isFastTrack ? 'text-orange-400' : 'text-purple-400'}`}>
                    Open Console <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
