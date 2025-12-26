'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface MyProposal {
    id: string;
    description: string;
    state: number;
}

export default function ActionCenterWidget() {
    const { account } = useWallet();
    const [actions, setActions] = useState<MyProposal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account) fetchMyActions();
    }, [account]);

    async function fetchMyActions() {
        try {
            // Use Public RPC for speed
            const READ_RPC = "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, readProvider);

            // Filter events where Proposer == Account
            // Note: Standard OZ Governor 'ProposalCreated' event index 1 is proposer
            const filter = gov.filters.ProposalCreated(null, account);

            // Limit search to reasonable timeframe (e.g. 50k blocks / ~4 days)
            // Ideally should be indexed query.
            const latest = await readProvider.getBlockNumber();
            const events = await gov.queryFilter(filter, latest - 50000, latest);

            const activeItems: MyProposal[] = [];

            // Check status of found proposals
            // Reverse to see latest first
            for (const e of events.reverse()) {
                const id = (e as any).args[0];
                const desc = (e as any).args[8];
                const state = await gov.state(id);
                // States: 1=Active, 4=Succeeded, 5=Queued
                // We only care about actionable ones or recently active
                if ([1n, 4n, 5n].includes(state)) {
                    activeItems.push({
                        id: id.toString(),
                        description: desc,
                        state: Number(state)
                    });
                }
                if (activeItems.length >= 3) break; // Limit to 3 items
            }
            setActions(activeItems);
        } catch (e) {
            console.error("Action fetch error", e);
        }
        setLoading(false);
    }

    if (loading) return <div className="glass-card p-6 h-full animate-pulse bg-white/5"></div>;
    if (actions.length === 0) return null; // Hide if nothing to do

    return (
        <div className="glass-card p-6 h-full border-l-4 border-l-red-500">
            <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-red-400" size={20} />
                <h3 className="font-bold text-white">Action Required</h3>
            </div>

            <div className="space-y-3">
                {actions.map(p => (
                    <Link href={`/proposals/${p.id}`} key={p.id} className="block bg-white/5 p-3 rounded hover:bg-white/10 transition">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-mono text-gray-500">#{p.id.substring(0, 6)}...</span>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.state === 1 ? 'bg-green-500/20 text-green-400' :
                                    p.state === 4 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-blue-500/20 text-blue-400'
                                }`}>
                                {p.state === 1 ? 'Vote Active' : p.state === 4 ? 'Needs Queue' : 'Execute Now'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-1">{p.description.split('\n')[0].replace('#', '').trim()}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
