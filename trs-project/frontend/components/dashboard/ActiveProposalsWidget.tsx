'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Vote, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ActiveProposalsWidget() {
    const { provider } = useWallet();
    const [activeCount, setActiveCount] = useState(0);
    const [latestProposal, setLatestProposal] = useState<{ id: string, title: string } | null>(null);

    useEffect(() => {
        // Try Cache First
        const cached = sessionStorage.getItem('activeProposals');
        if (cached) {
            const data = JSON.parse(cached);
            // Check if cache is fresh (< 5 mins)
            if (Date.now() - data.timestamp < 5 * 60 * 1000) {
                setActiveCount(data.count);
                setLatestProposal(data.latest);
                return;
            }
        }
        checkProposals();
    }, []);

    const refresh = () => {
        setLatestProposal(null);
        sessionStorage.removeItem('activeProposals');
        checkProposals();
    };

    async function checkProposals() {
        try {
            // Use Public RPC for reliable reading, matching ProposalsList
            const READ_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);

            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, readProvider);
            const latestBlock = await readProvider.getBlockNumber();
            const filter = gov.filters.ProposalCreated();
            let events: any[] = [];

            // Scan last 100k blocks in chunks to avoid RPC timeouts
            // Scan last ~2.5 hours blocks in chunks to avoid RPC timeouts
            const CHUNK_SIZE = 1500;
            const TOTAL_SEARCH = 3000;

            for (let i = 0; i < TOTAL_SEARCH; i += CHUNK_SIZE) {
                const to = latestBlock - i;
                const from = Math.max(0, to - CHUNK_SIZE);
                try {
                    const chunk = await gov.queryFilter(filter, from, to);
                    events = [...events, ...chunk];
                    // Removed sleep to speed up
                } catch (e) {
                    // console.warn(`Chunk failed ${from}-${to}`);
                }
                if (from === 0) break;
            }

            // Check state
            let count = 0;
            let latest = null;

            // Events are chronological. Reverse to get latest first.
            for (const e of events.reverse()) {
                const id = (e as any).args[0];
                try {
                    const state = await gov.state(id);
                    // 0=Pending, 1=Active
                    if (state === 1n || state === 0n) count++;

                    if (!latest) {
                        const desc = (e as any).args[8];
                        const titleMatch = desc.match(/^#\s+(.+)$/m);
                        latest = {
                            id: id.toString(),
                            title: titleMatch ? titleMatch[1] : `Proposal #${id.toString().substring(0, 4)}...`
                        };
                    }
                } catch (err) { console.warn("State fetch failed", err); }
            }
            setActiveCount(count);
            setLatestProposal(latest);

            // Cache Results
            sessionStorage.setItem('activeProposals', JSON.stringify({
                count: count,
                latest: latest,
                timestamp: Date.now()
            }));

        } catch (e) {
            console.warn(e);
        }
    }

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between group hover:border-purple-500/50 transition">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                    <Vote className="text-purple-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Governance</span>
            </div>
            <button onClick={(e) => { e.preventDefault(); refresh(); }} className="absolute top-6 right-6 text-gray-600 hover:text-white transition">
                <RefreshCw size={14} />
            </button>

            <div>
                <p className="text-4xl font-bold text-white mb-1">{activeCount}</p>
                <p className="text-sm text-gray-400 mb-4">Active Proposals</p>

                {latestProposal && (
                    <div className="text-xs bg-white/5 p-2 rounded border border-white/5">
                        <span className="text-gray-500 block mb-1">Latest:</span>
                        <span className="text-gray-300 line-clamp-1">{latestProposal.title}</span>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
                <Link href="/governance" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                    Vote Now -&gt;
                </Link>
            </div>
        </div>
    );
}
