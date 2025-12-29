'use client';

import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useWallet } from '../../../hooks/useWallet';
import { CheckCircle, XCircle, MinusCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ProposalDetailPage() {
    const { id } = useParams();
    const { provider, signer, account } = useWallet();
    const [proposal, setProposal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [votingPower, setVotingPower] = useState('0');
    const [snapshotPower, setSnapshotPower] = useState('0');

    useEffect(() => {
        if (provider && id) fetchProposalDetails();
    }, [provider, id]);

    useEffect(() => {
        if (account && provider && proposal?.snapshot) fetchVotingPower();
    }, [account, provider, proposal]);

    async function fetchVotingPower() {
        if (!account || !provider || !proposal) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);

            // 1. Current Power (For Delegation Check)
            const currentVotes = await token.getVotes(account);
            setVotingPower(formatEther(currentVotes));

            // 2. Snapshot Power (For this specific Proposal)
            // Use read-only provider for history if needed, but browser provider works for recent blocks
            // If snapshot is in future (impossible for active prop), fallback
            if (proposal.snapshot > 0) {
                const pastVotes = await token.getPastVotes(account, proposal.snapshot);
                setSnapshotPower(formatEther(pastVotes));
            }
        } catch (e) { console.error("Vote Fetch Error", e); }
    }

    async function delegate() {
        if (!signer) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, signer);
            const tx = await token.delegate(account);
            await tx.wait();
            alert("Voting Power Activated! (Note: You still can't vote on OLD proposals, only new ones)");
            fetchVotingPower();
        } catch (e: any) {
            console.error(e);
            alert("Delegation Failed: " + e.message);
        }
    }

    async function fetchProposalDetails() {
        if (!id) return;
        setLoading(true);
        try {
            // Use reliable public RPC for reads
            const READ_RPC = "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, readProvider);

            // Cannot filter by ID on-chain (non-indexed). Must fetch all and find.
            // Using same chunk strategy as list page.
            const latestBlock = await readProvider.getBlockNumber();
            const filter = gov.filters.ProposalCreated();

            let foundEvent = null;
            const CHUNK_SIZE = 1000;
            const TOTAL_SEARCH = 2000; // Search last ~1 hour only (Fast Load)

            for (let i = 0; i < TOTAL_SEARCH; i += CHUNK_SIZE) {
                const to = latestBlock - i;
                const from = Math.max(0, to - CHUNK_SIZE);
                try {
                    const chunk = await gov.queryFilter(filter, from, to);
                    // Client-side filter
                    const match = chunk.find((e: any) => e.args[0].toString() === id);
                    if (match) {
                        foundEvent = match;
                        break;
                    }
                } catch (e) { console.warn("Chunk failed", e); }
            }

            if (!foundEvent) {
                setLoading(false);
                return;
            }

            const args = (foundEvent as any).args;
            const state = await gov.state(args[0]);
            const votes = await gov.proposalVotes(args[0]);
            const snapshot = await gov.proposalSnapshot(args[0]);

            setProposal({
                id: args[0].toString(),
                proposer: args[1],
                description: args[8],
                state: Number(state),
                forVotes: formatEther(votes[1]),
                againstVotes: formatEther(votes[0]),
                abstainVotes: formatEther(votes[2]),
                targets: args[2],
                values: args[3],
                calldatas: args[4],
                snapshot: Number(snapshot)
            });

            if (Number(state) === 5) { // Queued
                try {
                    const etaVal = await gov.proposalEta(args[0]);
                    setEta(Number(etaVal));
                } catch (e) {
                    console.warn("Could not fetch ETA", e);
                }
            }

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    const [eta, setEta] = useState<number>(0);

    async function queueProposal() {
        if (!signer || !proposal) return;
        setVoting(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const descHash = ethers.id(proposal.description);
            const tx = await gov.queue(proposal.targets, proposal.values, proposal.calldatas, descHash);
            await tx.wait();
            alert("Proposal Queued!");
            fetchProposalDetails();
        } catch (e: any) {
            console.error(e);
            alert("Queue Failed: " + (e.reason || e.message));
        }
        setVoting(false);
    }

    async function executeProposal() {
        if (!signer || !proposal) return;
        setVoting(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const descHash = ethers.id(proposal.description);
            const tx = await gov.execute(proposal.targets, proposal.values, proposal.calldatas, descHash);
            await tx.wait();
            alert("Proposal Executed! Actions have been triggered.");
            fetchProposalDetails();
        } catch (e: any) {
            console.error(e);
            alert("Execution Failed: " + (e.reason || e.message));
        }
        setVoting(false);
    }

    async function castVote(support: number) {
        if (!signer) return;
        setVoting(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const tx = await gov.castVote(id, support);
            await tx.wait();
            alert("Vote Cast Successfully!");
            fetchProposalDetails(); // Refresh
        } catch (e: any) {
            console.error(e);
            alert("Vote Failed: " + (e.reason || e.message));
        }
        setVoting(false);
    }

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;
    if (!proposal) return <div className="p-20 text-center">Proposal Not Found</div>;

    const ProposalState = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <span className={`inline-block px-3 py-1 rounded text-xs font-bold mb-4 ${proposal.state === 1 ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                    }`}>
                    {ProposalState[proposal.state]}
                </span>
                <h1 className="text-3xl font-bold mb-2 break-all">Proposal #{proposal.id.substring(0, 8)}...</h1>
                <p className="text-gray-400 text-sm font-mono">Proposer: {proposal.proposer}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="md:col-span-2 space-y-8">
                    {/* Description / Content */}
                    <div className="glass-card p-8 bg-black/40 border border-white/10">
                        <h3 className="text-xl font-bold mb-4 text-white">Proposal Content</h3>
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                            {proposal.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Voting */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4">Current Results</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-green-400 font-bold">For</span>
                                    <span>{parseFloat(proposal.forVotes).toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '0%' /* Calculate % later */ }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-red-400 font-bold">Against</span>
                                    <span>{parseFloat(proposal.againstVotes).toLocaleString()}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-400 font-bold">Abstain</span>
                                    <span>{parseFloat(proposal.abstainVotes).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Queue & Execute Actions */}
                {(proposal.state === 4 || proposal.state === 5) && (
                    <div className="glass-card p-6 border-l-4 border-yellow-500">
                        <h3 className="font-bold mb-4">Execution Actions</h3>

                        {proposal.state === 4 && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400 mb-2">Proposal has succeeded. Queue it to start the timelock.</p>
                                <button onClick={queueProposal} disabled={voting} className="btn w-full bg-yellow-600 hover:bg-yellow-500 text-black py-3 font-bold flex items-center justify-center gap-2">
                                    <Clock size={18} /> Queue Proposal
                                </button>
                            </div>
                        )}

                        {proposal.state === 5 && (
                            <div className="space-y-2">
                                <p className="text-sm text-gray-400 mb-2">Proposal is queued. Waiting for timelock to expire.</p>
                                {eta > 0 && (
                                    <p className="text-xs text-yellow-400 font-mono mb-2">
                                        ETA: {new Date(eta * 1000).toLocaleString()}
                                        {Date.now() / 1000 < eta ? ` (Wait ${Math.ceil((eta - Date.now() / 1000) / 60)} mins)` : ' (Ready)'}
                                    </p>
                                )}
                                <button
                                    onClick={executeProposal}
                                    disabled={voting || (eta > 0 && Date.now() / 1000 < eta)}
                                    className={`btn w-full py-3 font-bold flex items-center justify-center gap-2 ${(eta > 0 && Date.now() / 1000 < eta)
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-500 text-white'
                                        }`}
                                >
                                    <CheckCircle size={18} /> Execute Proposal
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Voting Actions */}
                {proposal.state === 1 && account && (
                    <div className="glass-card p-6 border-l-4 border-blue-500">
                        <h3 className="font-bold mb-4">Cast Your Vote</h3>

                        {Number(snapshotPower) > 0 ? (
                            <div className="space-y-2">
                                <p className="text-xs text-green-400 mb-2 font-mono">
                                    Eligible Voting Power: {Number(snapshotPower).toLocaleString()} TRS
                                </p>
                                <button onClick={() => castVote(1)} disabled={voting} className="btn w-full bg-green-900/40 hover:bg-green-800/60 text-green-400 border border-green-500/30 py-3 flex items-center justify-center gap-2">
                                    <CheckCircle size={18} /> Vote For
                                </button>
                                <button onClick={() => castVote(0)} disabled={voting} className="btn w-full bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-500/30 py-3 flex items-center justify-center gap-2">
                                    <XCircle size={18} /> Vote Against
                                </button>
                                <button onClick={() => castVote(2)} disabled={voting} className="btn w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600/30 py-3 flex items-center justify-center gap-2">
                                    <MinusCircle size={18} /> Abstain
                                </button>
                            </div>
                        ) : (
                            <div className="bg-yellow-900/20 p-4 rounded border border-yellow-500/30">
                                <div className="flex items-center gap-2 text-yellow-500 font-bold mb-2">
                                    <AlertTriangle size={18} /> Ineligible to Vote
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    {Number(votingPower) > 0 ? (
                                        <span>
                                            You currently have <strong>{Number(votingPower).toLocaleString()} Voting Power</strong>, BUT you had <strong>0 Power</strong> at the time this proposal was created (Snapshot Block #{proposal.snapshot}).
                                            <br /><br />
                                            This means you acquired tokens or delegated <em>after</em> the proposal started. You will be able to vote on <strong>future</strong> proposals.
                                        </span>
                                    ) : (
                                        <span>
                                            You have 0 Voting Power. You must <strong>Delegate</strong> tokens to yourself to activate power.
                                        </span>
                                    )}
                                </p>
                                {Number(votingPower) === 0 && (
                                    <button
                                        onClick={delegate}
                                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded transition"
                                    >
                                        Activate Voting Power
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
