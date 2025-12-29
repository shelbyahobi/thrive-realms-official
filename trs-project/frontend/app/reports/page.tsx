"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { useWallet } from '@/hooks/useWallet';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface ProjectOption {
    name: string;
    address: string;
}

export default function ReportsPage() {
    const { signer, account } = useWallet();
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [milestoneIndex, setMilestoneIndex] = useState(0);
    const [reportLink, setReportLink] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!account) return;
        async function loadProjects() {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const registry = new ethers.Contract(
                    CONTRACT_ADDRESSES.PROJECT_REGISTRY,
                    CONTRACT_ABIS.ExecutionRegistry,
                    provider
                );
                const addresses = await registry.getAllProjects();

                const list = [];
                for (const addr of addresses) {
                    const info = await registry.projects(addr);
                    if (info.active) {
                        list.push({ name: info.name, address: addr });
                    }
                }
                setProjects(list);
                if (list.length > 0) setSelectedProject(list[0].address);
            } catch (e) {
                console.error(e);
            }
        }
        loadProjects();
    }, [account]);

    async function submitReport() {
        if (!signer || !selectedProject) return;
        setLoading(true);
        try {
            // Interact with the specific ProjectEscrow contract
            const escrow = new ethers.Contract(
                selectedProject,
                CONTRACT_ABIS.ProjectEscrow,
                signer
            );

            const tx = await escrow.submitReport(milestoneIndex, reportLink);
            await tx.wait();

            alert("Report submitted successfully! Funds will unlock if approved.");
            setReportLink('');
        } catch (e: any) {
            console.error(e);
            alert(`Submission failed: ${e.reason || e.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-12 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                Project Reporting
            </h1>
            <p className="text-gray-400 mb-8">
                Submit milestone reports to unlock escrowed funds.
            </p>

            <div className="w-full max-w-md p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm">
                {!account ? (
                    <div className="text-center text-yellow-400 p-4 border border-yellow-500/30 rounded bg-yellow-500/10">
                        <AlertCircle className="mx-auto mb-2" />
                        Please connect your wallet to submit reports.
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Select Project</label>
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-purple-500"
                            >
                                {projects.map(p => (
                                    <option key={p.address} value={p.address}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Milestone Index</label>
                            <input
                                type="number"
                                min="0" max="5"
                                value={milestoneIndex}
                                onChange={(e) => setMilestoneIndex(Number(e.target.value))}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-purple-500"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Check your contract for milestone definitions.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Proof of Work (IPFS/URL)</label>
                            <input
                                type="text"
                                placeholder="ipfs://Qm..."
                                value={reportLink}
                                onChange={(e) => setReportLink(e.target.value)}
                                className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-purple-500"
                            />
                        </div>

                        <button
                            onClick={submitReport}
                            disabled={loading || !selectedProject}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold py-3 rounded-lg transition-colors flex justify-center"
                        >
                            {loading ? 'Submitting...' : 'Submit On-Chain'}
                        </button>
                    </div>
                )}
            </div>

            <Link href="/transparency" className="mt-8 text-gray-500 hover:text-white flex items-center gap-2 text-sm">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
        </main>
    );
}
