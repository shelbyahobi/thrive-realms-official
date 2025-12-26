'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import Link from 'next/link';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';

interface Proposal {
    id: string;
    proposer: string;
    description?: string;
    state: number;
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
}

const ProposalState = [
    "Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"
];

export default function ProposalsList() {
    const { provider, signer, account } = useWallet();
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [votingPower, setVotingPower] = useState('0');
    const [filter, setFilter] = useState<'all' | 'mandates' | 'approvals'>('all');

    useEffect(() => {
        if (provider) {
            fetchProposals();
            if (account) fetchVotingPower();
        }
    }, [provider, account]);

    async function fetchVotingPower() {
        if (!account || !provider) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const votes = await token.getVotes(account);
            setVotingPower(formatEther(votes));
        } catch (e) { console.error(e); }
    }

    async function delegate() {
        if (!signer) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, signer);
            const tx = await token.delegate(account);
            await tx.wait();
            alert("Voting Power Activated!");
            fetchVotingPower();
        } catch (e: any) {
            console.error(e);
            alert("Delegation Failed: " + e.message);
        }
    }

    async function fetchProposals() {
        setLoading(true);
        try {
            const READ_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);

            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, readProvider);
            const latestBlock = await readProvider.getBlockNumber();

            const filter = gov.filters.ProposalCreated();
            let events: any[] = [];

            const CHUNK_SIZE = 500;
            const TOTAL_SEARCH = 500; // Search last ~25 mins only (Flash Speed)

            for (let i = 0; i < TOTAL_SEARCH; i += CHUNK_SIZE) {
                const to = latestBlock - i;
                const from = Math.max(0, to - CHUNK_SIZE);
                try {
                    const chunk = await gov.queryFilter(filter, from, to);
                    events = [...events, ...chunk];
                    // Removed sleep to speed up
                } catch (e: any) {
                    console.warn(`Error ${from}-${to}:`, e.message);
                }
            }

            if (events.length === 0) console.warn("Scan complete. No events found.");

            const list: Proposal[] = await Promise.all(events.reverse().slice(0, 10).map(async (event) => {
                const args = (event as any).args;
                const id = args[0];
                const proposer = args[1];
                const desc = args[8];

                // Fetch details in parallel
                const [state, votes] = await Promise.all([
                    gov.state(id),
                    gov.proposalVotes(id)
                ]);

                return {
                    id: id.toString(),
                    proposer: proposer,
                    description: desc || "",
                    state: Number(state),
                    forVotes: formatEther(votes[1]),
                    againstVotes: formatEther(votes[0]),
                    abstainVotes: formatEther(votes[2]),
                };
            }));
            setProposals(list);
        } catch (e) {
            console.error("Fetch Error", e);
        }
        setLoading(false);
    }

    const filteredProposals = proposals.filter(p => {
        if (filter === 'all') return true;
        const desc = p.description || "";
        const isApproval = desc.includes("Execution Entity Approval") || desc.includes("Approve Execution Partner");
        if (filter === 'approvals') return isApproval;
        if (filter === 'mandates') return !isApproval;
        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
                <div className="flex gap-4 items-center">
                    <div className="bg-white/5 rounded-lg p-1 flex text-xs font-bold">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
                        <button onClick={() => setFilter('mandates')} className={`px-3 py-1.5 rounded ${filter === 'mandates' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Mandates</button>
                        <button onClick={() => setFilter('approvals')} className={`px-3 py-1.5 rounded ${filter === 'approvals' ? 'bg-yellow-600 text-black' : 'text-gray-400 hover:text-white'}`}>Approvals</button>
                    </div>
                    <Link href="/proposals/new" className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> New Proposal
                    </Link>
                </div>
            </div>

            {/* Delegation Warning */}
            {parseFloat(votingPower) === 0 && (
                <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-lg flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-3 text-yellow-500">
                        <AlertTriangle size={24} />
                        <div>
                            <h3 className="font-bold">Voting Power Inactive</h3>
                            <p className="text-sm">You have TRS but haven't delegated voting power to yourself yet.</p>
                        </div>
                    </div>
                    <button onClick={delegate} disabled={loading} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400">
                        {loading ? 'Delegating...' : 'Activate Voting Power'}
                    </button>
                </div>
            )}

            {loading && <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>}

            <div className="space-y-4">
                {filteredProposals.map(p => {
                    const desc = p.description || "";
                    const titleMatch = desc.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : `Proposal #${p.id.substring(0, 6)}...`;
                    const summary = desc.replace(/^#\s+.+$/m, '').substring(0, 150) + "...";

                    return (
                        <Link href={`/proposals/${p.id}`} key={p.id} className="block glass-card hover:border-purple-500/50 transition duration-200 group">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{title}</h3>
                                <span className={`px-3 py-1 rounded text-xs font-bold ${p.state === 1 ? 'bg-green-500/20 text-green-400' :
                                    p.state === 4 ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300'
                                    }`}>
                                    {ProposalState[p.state]}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4 font-mono opacity-70">{summary}</p>
                            <div className="grid grid-cols-3 gap-4 text-center text-xs bg-black/40 p-3 rounded border border-white/5">
                                <div>
                                    <span className="block text-green-400 font-bold text-lg">{parseFloat(p.forVotes).toLocaleString()}</span>
                                    <span className="text-gray-500 uppercase tracking-wider">For</span>
                                </div>
                                <div>
                                    <span className="block text-red-400 font-bold text-lg">{parseFloat(p.againstVotes).toLocaleString()}</span>
                                    <span className="text-gray-500 uppercase tracking-wider">Against</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 font-bold text-lg">{parseFloat(p.abstainVotes).toLocaleString()}</span>
                                    <span className="text-gray-500 uppercase tracking-wider">Abstain</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
