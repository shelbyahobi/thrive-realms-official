'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import Link from 'next/link';
import { Plus, Loader2, AlertTriangle, Vote } from 'lucide-react';

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
    const [delegatedTo, setDelegatedTo] = useState<string>(ethers.ZeroAddress);
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
            // Fetch both votes and delegation status
            const [votes, currentDelegate] = await Promise.all([
                token.getVotes(account),
                token.delegates(account)
            ]);
            setVotingPower(formatEther(votes));
            setDelegatedTo(currentDelegate);
        } catch (e) { console.error(e); }
    }

    async function delegate() {
        if (!signer) return;
        setLoading(true);
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, signer);
            const tx = await token.delegate(account);
            await tx.wait();
            alert("Voting Power Activated!");
            fetchVotingPower();
        } catch (e: any) {
            console.error(e);
            alert("Delegation Failed: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    const [oldestBlockScanned, setOldestBlockScanned] = useState(0);
    const [scanStatus, setScanStatus] = useState("");

    async function fetchProposals(loadScan = false) {
        setLoading(true);
        if (loadScan) setScanStatus("Scanning deeper history...");
        else setScanStatus("Scanning active proposals...");

        try {
            const READ_RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);

            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, readProvider);
            const latestBlock = await readProvider.getBlockNumber();

            // If loading more, start from where we left off. Otherwise start from latest.
            const startBlock = loadScan && oldestBlockScanned > 0 ? oldestBlockScanned : latestBlock;

            const CHUNK_SIZE = 5000;
            const SCAN_DEPTH = 200000; // ~7 Days of history per "Load"

            const filter = gov.filters.ProposalCreated();
            let events: any[] = [];

            let currentTo = startBlock;
            const targetFrom = Math.max(0, startBlock - SCAN_DEPTH);

            // Scan backwards in chunks
            while (currentTo > targetFrom) {
                const currentFrom = Math.max(targetFrom, currentTo - CHUNK_SIZE);
                try {
                    // Update status for user feedback
                    setScanStatus(`Scanning blocks ${currentFrom} - ${currentTo}...`);
                    const chunk = await gov.queryFilter(filter, currentFrom, currentTo);
                    events = [...events, ...chunk];
                } catch (e: any) {
                    console.warn(`Block scan error ${currentFrom}-${currentTo}:`, e.message);
                }
                currentTo = currentFrom;
                if (currentTo <= 0) break;
            }

            setOldestBlockScanned(currentTo); // Save progress for next "Load More"

            if (events.length === 0) console.warn("No new events found in this range.");

            const newProposals: Proposal[] = await Promise.all(events.reverse().map(async (event) => {
                const args = (event as any).args;
                const id = args[0];
                const proposer = args[1];
                const desc = args[8];

                // Fetch details in parallel (consider batching if too slow)
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

            // Merge with existing if loading more, otherwise replace
            // Deduplicate by ID just in case
            setProposals(prev => {
                const combined = loadScan ? [...prev, ...newProposals] : newProposals;
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                // Sort by ID descending (newest first)
                return unique.sort((a, b) => Number(b.id) - Number(a.id));
            });

        } catch (e) {
            console.error("Fetch Error", e);
        }
        setLoading(false);
        setScanStatus("");
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
                <div>
                    <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
                    <p className="text-xs text-gray-500 font-mono mt-1">System v2.4 (24h Governance)</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="bg-white/5 rounded-lg p-1 flex text-xs font-bold">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>All</button>
                        <button onClick={() => setFilter('mandates')} className={`px-3 py-1.5 rounded ${filter === 'mandates' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Mandates</button>
                        <button onClick={() => setFilter('approvals')} className={`px-3 py-1.5 rounded ${filter === 'approvals' ? 'bg-yellow-600 text-black' : 'text-gray-400 hover:text-white'}`}>Approvals</button>
                    </div>
                    <Link href="/governance/create" className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> New Proposal
                    </Link>
                </div>
            </div>

            {/* Governance Stats Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Power Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/60 to-black border border-purple-500/30 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Vote size={100} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">Your Governance Power</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white">{Number(votingPower).toLocaleString()}</span>
                            <span className="text-sm font-bold text-gray-400">VP</span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${delegatedTo !== ethers.ZeroAddress ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
                            <span className="text-sm text-gray-300">
                                {delegatedTo === ethers.ZeroAddress
                                    ? "Voting Power Inactive (Delegation Required)"
                                    : delegatedTo.toLowerCase() === account?.toLowerCase()
                                        ? "Self-Delegated (Active)"
                                        : `Delegated to ${delegatedTo.slice(0, 6)}...`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Card */}
                <div className="relative rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-center gap-4">
                    <h3 className="text-gray-200 text-sm font-bold uppercase tracking-wider">Quick Actions</h3>
                    {parseFloat(votingPower) === 0 || delegatedTo === ethers.ZeroAddress ? (
                        <button
                            onClick={delegate}
                            disabled={loading}
                            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 px-8 py-3 font-bold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : <AlertTriangle size={18} />}
                                {loading ? 'Processing...' : 'Activate Voting Power'}
                            </span>
                        </button>
                    ) : (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                            <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                                <Plus size={16} /> Voting Power Active
                            </span>
                            <p className="text-xs text-gray-500 mt-1">You are ready to vote on active proposals.</p>
                        </div>
                    )}
                </div>
            </div>

            {loading && !proposals.length && (
                <div className="text-center py-12">
                    <Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={40} />
                    <h3 className="text-xl font-bold text-white mb-2">Syncing DAO State...</h3>
                    <span className="text-sm text-gray-500 font-mono block bg-black/30 p-2 rounded max-w-sm mx-auto border border-white/10">
                        {scanStatus || "Initializing connection..."}
                    </span>
                </div>
            )}

            <div className="space-y-4">
                {filteredProposals.map(p => {
                    const desc = p.description || "";
                    const titleMatch = desc.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : `Proposal #${p.id.substring(0, 6)}...`;

                    // Clean summary
                    let summary = desc
                        .replace(/^#\s+.+$/m, '')
                        .replace(/^\|.*$/gm, '')
                        .replace(/^\s*[\-\*]{3,}\s*$/gm, '')
                        .replace(/#+/g, '')
                        .trim()
                        .substring(0, 150) + "...";

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

                {(!loading || scanStatus) && (
                    <div className="text-center pt-8 border-t border-white/10">
                        <p className="text-xs text-gray-500 mb-4">
                            Scanned history up to block {oldestBlockScanned > 0 ? oldestBlockScanned.toLocaleString() : "current"}
                        </p>
                        <button
                            onClick={() => fetchProposals(true)}
                            disabled={loading}
                            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 font-bold transition-all text-center mx-auto block"
                        >
                            {loading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> {scanStatus || "Scanning..."}</span> : "Load Deeper History (7 Days)"}
                        </button>
                        <p className="text-xs text-gray-600 mt-2">
                            Don't see your proposal? Use this to look further back in time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
