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

    const [reporting, setReporting] = useState(false);
    const [reportText, setReportText] = useState("");

    async function submitReport() {
        if (!signer) return;
        try {
            const escrow = new ethers.Contract(address as string, CONTRACT_ABIS.ProjectEscrow, signer);
            // For MVP, we attach report to the *next* unpaid milestone or just index 0 if generic?
            // Contract requires (index, uri). We should find the first unpaid milestone.
            const nextMilestoneIndex = project.milestones.findIndex((m: any) => !m.released);

            if (nextMilestoneIndex === -1) {
                alert("All milestones completed!");
                return;
            }

            // In real app, upload text to IPFS. Here, we use text as URI for MVP.
            const tx = await escrow.submitReport(nextMilestoneIndex, reportText);
            await tx.wait();
            alert("Report Submitted Successfully!");
            setReporting(false);
            fetchDetails();
        } catch (e: any) {
            console.error(e);
            alert("Report Failed: " + (e.reason || e.message));
        }
    }

    async function depositDividend() {
        if (!signer) return;
        const amount = prompt("Enter Amount of TRS to deposit as Dividend:");
        if (!amount) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, signer);
            const vault = new ethers.Contract(CONTRACT_ADDRESSES.DIVIDEND_VAULT, CONTRACT_ABIS.DividendVault, signer);
            const amtWei = ethers.parseEther(amount);

            // Approve
            const txApprove = await token.approve(CONTRACT_ADDRESSES.DIVIDEND_VAULT, amtWei);
            await txApprove.wait();

            // Deposit
            const tx = await vault.deposit(amtWei);
            await tx.wait();
            alert("Dividends Distributed Successfully!");
        } catch (e: any) {
            console.error(e);
            alert("Deposit Failed: " + (e.reason || e.message));
        }
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            {/* Header & Stats - Keep Existing Structure */}
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

            {/* ACTION CENTER */}
            <div className="mt-12 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-white">Cockpit Actions</h3>
                        <p className="text-xs text-gray-500">Manage execution, reporting, and revenue.</p>
                    </div>
                    <div className="flex gap-4">
                        {!reporting && (
                            <button onClick={() => setReporting(true)} className="btn btn-secondary flex items-center gap-2">
                                <Send size={18} /> Submit Report
                            </button>
                        )}
                        <button onClick={depositDividend} className="btn bg-green-600 hover:bg-green-500 text-white flex items-center gap-2">
                            <DollarSign size={18} /> Deposit Dividends
                        </button>
                    </div>
                </div>

                {/* REPORTING FORM */}
                {reporting && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm text-gray-400 mb-2">Progress Report content (IPFS Hash or Text)</label>
                        <textarea
                            value={reportText}
                            onChange={e => setReportText(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded p-4 text-white min-h-[100px] mb-4"
                            placeholder="Describe progress, metrics achieved, and proof of work..."
                        />
                        <div className="flex gap-4">
                            <button onClick={submitReport} className="btn btn-primary bg-purple-600 text-white">Submit Report to Chain</button>
                            <button onClick={() => setReporting(false)} className="btn text-gray-400 hover:text-white">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
