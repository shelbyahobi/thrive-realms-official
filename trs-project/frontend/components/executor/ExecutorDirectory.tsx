'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { ShieldCheck, Globe, Building2 } from 'lucide-react';

interface ExecutorProfile {
    address: string;
    name: string;
    type: string;
    isVerified: boolean;
}

export default function ExecutorDirectory() {
    const { provider } = useWallet();
    const [executors, setExecutors] = useState<ExecutorProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider) fetchExecutors();
    }, [provider]);

    const fetchExecutors = async () => {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.EXECUTION_REGISTRY, CONTRACT_ABIS.ExecutionRegistry, provider);

            // Query "EntityVerified" events from the beginning
            // Note: In production, consider range limits. For MVP, query from block 0.
            const filter = registry.filters.EntityVerified();
            const events = await registry.queryFilter(filter);

            // Map addresses to current profiles
            // We use a Set to get unique addresses
            const addresses = Array.from(new Set(events.map((e: any) => e.args[0])));

            const profiles = await Promise.all(addresses.map(async (addr: string) => {
                const profile = await registry.getEntity(addr);
                // Enum map: 0=Unknown, 1=Standard, 2=FiatBridge, 3=ExecutionPod
                const typeMap = ["Unknown", "Standard Entity", "Fiat Bridge", "Execution Pod"];

                return {
                    address: addr,
                    name: profile.name || "Anonymous Entity",
                    type: typeMap[Number(profile.entityType)] || "Unknown",
                    isVerified: profile.isVerified
                };
            }));

            // Filter only verified
            setExecutors(profiles.filter(p => p.isVerified));

        } catch (e) {
            console.error("Error fetching directory", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center p-8 text-gray-500 animate-pulse">Scanning Registry...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executors.map((exec, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Building2 size={24} />
                        </div>
                        {exec.isVerified && (
                            <div className="flex items-center gap-1 text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <ShieldCheck size={12} /> Verified
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{exec.name}</h3>
                    <div className="text-sm font-mono text-gray-400 mb-4 truncate" title={exec.address}>
                        {exec.address}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                        <Globe size={12} /> {exec.type}
                    </div>
                </div>
            ))}

            {executors.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl text-gray-500">
                    No verified partners found in registry.
                </div>
            )}
        </div>
    );
}
