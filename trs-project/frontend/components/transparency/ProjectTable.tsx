"use client";
import React, { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { ExternalLink, CheckCircle, Clock, Star, X } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';

interface Project {
    address: string;
    name: string;
    active: boolean;
    registeredAt: number;
}

export function ProjectTable() {
    const { signer } = useWallet();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [auditingProject, setAuditingProject] = useState<Project | null>(null);
    const [auditScore, setAuditScore] = useState(100);
    const [auditComment, setAuditComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // View State
    const [viewProject, setViewProject] = useState<Project | null>(null);
    const [audits, setAudits] = useState<any[]>([]);
    const [loadingAudits, setLoadingAudits] = useState(false);

    async function viewingProject(p: Project) {
        setViewProject(p);
        setLoadingAudits(true);
        setAudits([]); // Clear old

        if (typeof window.ethereum === 'undefined') return;

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const registry = new ethers.Contract(
                CONTRACT_ADDRESSES.PROJECT_REGISTRY,
                CONTRACT_ABIS.ExecutionRegistry,
                provider
            );

            // Fetch audits by iterating index until error
            const results = [];
            let i = 0;
            while (true) {
                try {
                    // Try waiting for promise to fail or succeed
                    const audit = await registry.projectAudits(p.address, i);
                    results.push(audit);
                    i++;
                    if (i > 50) break; // Safety break
                } catch (e) {
                    break; // End of array
                }
            }
            setAudits(results.reverse()); // Newest first
        } catch (e) {
            console.error(e);
        }
        setLoadingAudits(false);
    }

    useEffect(() => {
        async function fetchProjects() {
            if (typeof window.ethereum === 'undefined') return;
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const registry = new ethers.Contract(
                    CONTRACT_ADDRESSES.PROJECT_REGISTRY,
                    CONTRACT_ABIS.ExecutionRegistry,
                    provider
                );

                // Fetch all project addresses
                const addresses = await registry.getAllProjects();

                // Fetch details for each
                const projectList = await Promise.all(addresses.map(async (addr: string) => {
                    const info = await registry.projects(addr);
                    return {
                        address: info.escrowAddress,
                        name: info.name,
                        active: info.active,
                        registeredAt: Number(info.registeredAt)
                    };
                }));

                setProjects(projectList);
            } catch (e) {
                console.error("Error fetching projects:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, []);

    async function submitAudit() {
        if (!signer || !auditingProject) return;
        setSubmitting(true);
        try {
            const registry = new ethers.Contract(
                CONTRACT_ADDRESSES.PROJECT_REGISTRY,
                CONTRACT_ABIS.ExecutionRegistry,
                signer
            );

            // Call auditProject(address, score, comment)
            const tx = await registry.auditProject(auditingProject.address, auditScore, auditComment);
            await tx.wait();

            alert(`Successfully audited ${auditingProject.name}! Trust Score updated.`);
            setAuditingProject(null);
            setAuditScore(100);
            setAuditComment('');
        } catch (e) {
            console.error(e);
            alert("Audit failed. See console.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Execution Ledger...</div>;

    return (
        <>
            <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="p-4">Project Name</th>
                            <th className="p-4">Executor / Contract</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Registered</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {projects.map((p) => (
                            <tr key={p.address} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{p.name}</td>
                                <td className="p-4 font-mono text-xs text-blue-400">
                                    <a href={`https://testnet.bscscan.com/address/${p.address}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                                        {p.address.substring(0, 6)}...{p.address.substring(38)}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </td>
                                <td className="p-4">
                                    {p.active ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <Clock className="w-3 h-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="text-gray-500">Completed</span>
                                    )}
                                </td>
                                <td className="p-4">{new Date(p.registeredAt * 1000).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => setAuditingProject(p)}
                                        className="text-white hover:text-purple-400 text-xs border border-white/20 hover:border-purple-400 rounded px-2 py-1 transition-colors flex items-center gap-1"
                                    >
                                        <Star className="w-3 h-3" /> Audit
                                    </button>
                                    <button
                                        onClick={() => viewingProject(p)}
                                        className="text-white hover:text-blue-400 text-xs border border-white/20 hover:border-blue-400 rounded px-2 py-1 transition-colors flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" /> Reports
                                    </button>
                                </div>
                            </td>
                </tr>
            ))}
                    {projects.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">No registered projects found on-chain.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div >

            {/* Audit Modal (Write) */ }
    {
        auditingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                    <button onClick={() => setAuditingProject(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-2">Audit Project</h3>
                    <p className="text-sm text-gray-400 mb-6">Rate execution of <span className="text-purple-400">{auditingProject.name}</span></p>
                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Trust Score (0-100)</label>
                            <input type="number" min="0" max="100" value={auditScore} onChange={(e) => setAuditScore(Number(e.target.value))} className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-purple-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-300 mb-1">Audit Comment / Hash</label>
                            <textarea rows={3} value={auditComment} onChange={(e) => setAuditComment(e.target.value)} placeholder="Confirm verification status..." className="w-full bg-black border border-white/20 rounded p-2 text-white focus:border-purple-500 outline-none" />
                        </div>
                        <button onClick={submitAudit} disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                            {submitting ? 'Submitting...' : 'Sign & Submit Audit'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    {/* View Reports Modal (Read) */ }
    {
        viewProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
                    <button onClick={() => setViewProject(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-2">Transparency Reports</h3>
                    <p className="text-sm text-gray-400 mb-6">Audit history for <span className="text-blue-400">{viewProject.name}</span></p>

                    {loadingAudits ? (
                        <div className="text-center py-8 text-gray-500">Fetching on-chain records...</div>
                    ) : audits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-white/5 rounded-lg border border-dashed border-white/10">
                            No reports submitted yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {audits.map((a, i) => (
                                <div key={i} className="glass-card p-4 border border-white/10 bg-black/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${a.score >= 80 ? 'text-green-400' : a.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {a.score}/100
                                            </span>
                                            <span className="text-xs text-gray-500 px-2 py-0.5 bg-white/5 rounded">Trust Score</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {new Date(Number(a.timestamp) * 1000).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap mb-3 pl-2 border-l-2 border-white/10">
                                        {a.comment}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono border-t border-white/5 pt-2">
                                        <span>Auditor:</span>
                                        <span className="text-blue-400">{a.auditor}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }
        </>
    );
}
