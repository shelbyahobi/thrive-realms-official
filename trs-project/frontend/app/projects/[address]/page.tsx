'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useWallet } from '../../../hooks/useWallet';
import { Loader2, CheckCircle, Lock, Unlock, DollarSign, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectDetails() {
    const { address } = useParams();
    const { provider, signer, account } = useWallet();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider && address) fetchDetails();
    }, [provider, address]);

    async function fetchDetails() {
        if (!provider) return;
        try {
            const escrow = new ethers.Contract(address as string, CONTRACT_ABIS.ProjectEscrow, provider);
            const title = await escrow.title();
            const category = await escrow.category();
            const executor = await escrow.executor();
            const totalBudget = await escrow.totalBudget();
            const released = await escrow.releasedAmount();

            // Reconstruct milestones (Need to check if array is public or accessor needed)
            // For MVP, if contract doesn't return array, we might just show state.
            // Assuming we added a getMilestones helper or public array getter.
            // If not available, we just show budget. 
            // Let's assume we can get milestone count and iterate or it returns struct array.

            // MOCKING Milestones for Display if contract doesn't return full list easily without indexer
            const milestones = [
                { id: 0, amount: formatEther(totalBudget / 3n), desc: "Initial Setup", released: released > 0n },
                { id: 1, amount: formatEther(totalBudget / 3n), desc: "Development Phase", released: released > totalBudget / 3n },
                { id: 2, amount: formatEther(totalBudget / 3n), desc: "Final Delivery", released: released > (totalBudget * 2n) / 3n }
            ];

            setProject({
                address, title, category, executor,
                budget: formatEther(totalBudget),
                released: formatEther(released),
                milestones
            });
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function releaseMilestone(index: number, amount: string) {
        // This usually requires a Vote. We should link to "New Proposal (Milestone Release)"
        // Or if the contract allows admin/founder release.
        // Assuming Governance Required:
        window.location.href = `/proposals/new?type=milestone&escrow=${address}&index=${index}&amount=${amount}`;
    }

    async function depositDividend() {
        // Implementation for depositing dividends
        if (!signer) return;
        const amount = prompt("Enter Amount of TRS/BNB to deposit as Dividend:");
        if (!amount) return;
        // Logic to approve and call DividendVault.deposit()
        alert("Feature coming soon: Dividend Deposit Integration");
    }

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;
    if (!project) return <div className="p-12 text-center">Project Not Found</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="mb-8">
                <span className="text-sm text-blue-400 font-bold uppercase tracking-wider">{project.category}</span>
                <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
                <p className="text-gray-400 font-mono">ID: {project.address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="glass-card p-6 border-l-4 border-green-500">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Budget</p>
                    <p className="text-2xl font-mono text-white">{parseFloat(project.budget).toLocaleString()} TRS</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Released</p>
                    <p className="text-2xl font-mono text-white">{parseFloat(project.released).toLocaleString()} TRS</p>
                </div>
                <div className="glass-card p-6 border-l-4 border-gray-500">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Executor</p>
                    <p className="text-sm text-white break-all">{project.executor}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">Milestones & Funding</h2>
            <div className="space-y-4">
                {project.milestones.map((m: any) => (
                    <div key={m.id} className={`glass-card p-6 flex justify-between items-center ${m.released ? 'border-green-500/30 bg-green-900/10' : ''}`}>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-white">Milestone {m.id + 1}</span>
                                {m.released ? <CheckCircle size={16} className="text-green-400" /> : <Lock size={16} className="text-gray-500" />}
                            </div>
                            <p className="text-gray-400 text-sm">{m.desc}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-white text-xl">{parseFloat(m.amount).toLocaleString()} TRS</p>
                            {!m.released && (
                                <button
                                    onClick={() => releaseMilestone(m.id, m.amount)}
                                    className="mt-2 text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded font-bold"
                                >
                                    Request Release
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">Project Management</h3>
                    <p className="text-xs text-gray-500">Actions for Founder & Executor</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Send size={18} /> Update Status
                    </button>
                    <button onClick={depositDividend} className="btn bg-green-600 hover:bg-green-500 text-white flex items-center gap-2">
                        <DollarSign size={18} /> Deposit Dividends
                    </button>
                </div>
            </div>
        </div>
    );
}
