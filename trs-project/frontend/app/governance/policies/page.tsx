'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { Shield, Lock, Activity, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function PoliciesContent() {
    const { provider } = useWallet();
    const [policies, setPolicies] = useState<{ key: string, label: string, value: string, desc: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const POLICY_KEYS = [
        { key: "MAX_PROJECT_BUDGET", label: "Max Project Budget", desc: "Maximum TRS allowed per single funding proposal." },
        { key: "GLOBAL_EPOCH_CAP", label: "Global Epoch Cap", desc: "Total TRS deployable across all projects per epoch." },
        { key: "MIN_REPUTATION_FAST_TRACK", label: "Fast Track Threshold", desc: "Reputation score required to access accelerated funding." },
    ];

    useEffect(() => {
        if (provider) {
            fetchPolicies();
        }
    }, [provider]);

    const fetchPolicies = async () => {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.POLICY_REGISTRY, CONTRACT_ABIS.PolicyRegistry, provider);

            const results = await Promise.all(POLICY_KEYS.map(async (p) => {
                const val = await registry.getPolicy(p.key);
                // Heuristic: If value looks like Ether (large number), format it. If small, keep properly.
                // Fast Track (80) vs Budget (50000e18)
                let formatted = val.toString();
                if (val > 1000000n) { // Arbitrary threshold to detect Wei
                    formatted = ethers.formatEther(val) + " TRS";
                }
                return { ...p, value: formatted };
            }));

            setPolicies(results);
        } catch (e) {
            console.error("Error fetching policies", e);
        }
        setLoading(false);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2 flex items-center gap-3">
                        <Shield className="text-purple-500" />
                        Governance Policies
                    </h1>
                    <p className="text-gray-400">
                        Immutable strictures enforced by the Policy Registry. Modifications require a DAO vote.
                    </p>
                </div>
                <Link href="/governance" className="px-4 py-2 rounded border border-white/10 hover:bg-white/5 text-sm transition">
                    Back to Governance
                </Link>
            </div>

            {/* POLICY GRID */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 animate-pulse">Loading Chain Policies...</div>
                ) : (
                    policies.map((p, i) => (
                        <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-purple-500/50 transition">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-black/50 text-gray-400 group-hover:text-purple-400 transition">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{p.label}</h3>
                                    <div className="text-xs font-mono text-gray-500">{p.key}</div>
                                    <p className="text-sm text-gray-400 mt-1">{p.desc}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-mono font-bold text-white">{p.value}</div>
                                <div className="text-xs text-green-400 flex items-center justify-end gap-1">
                                    <Activity size={10} /> Active
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* INFO BOX */}
            <div className="mt-8 p-6 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-start gap-4">
                <AlertTriangle className="text-blue-400 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-200 mb-1">How to Change Policies?</h4>
                    <p className="text-sm text-blue-200/60">
                        Policies are managed by the <code>PolicyRegistry</code> contract. To change a value, you must submit a Governance Proposal calling <code>setPolicy(key, newValue)</code>.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PoliciesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PoliciesContent />
        </Suspense>
    );
}
