'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Activity, Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PolicyHealthWidget() {
    const { provider } = useWallet();
    const [maxBudget, setMaxBudget] = useState<string>('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider) checkPolicy();
    }, [provider]);

    async function checkPolicy() {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.POLICY_REGISTRY, CONTRACT_ABIS.PolicyRegistry, provider);
            const val = await registry.getPolicy("MAX_PROJECT_BUDGET");
            setMaxBudget(ethers.formatEther(val));
        } catch (e) {
            console.error("Error fetching policy", e);
        }
        setLoading(false);
    }

    if (loading) return <div className="glass-card p-6 h-full animate-pulse bg-white/5"></div>;

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Activity className="text-blue-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Health</span>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm font-bold text-green-400 uppercase">Nominal</span>
                </div>
                <p className="text-sm text-gray-400">
                    Max Project Cap: <strong className="text-white">{parseInt(maxBudget).toLocaleString()} TRS</strong>
                </p>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
                <Link href="/governance/policies" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold">
                    View Guardrails <Lock size={14} />
                </Link>
            </div>
        </div>
    );
}
