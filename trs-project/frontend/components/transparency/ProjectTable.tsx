"use client";
import React, { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { ExternalLink, CheckCircle, Clock } from 'lucide-react';

interface Project {
    address: string;
    name: string;
    active: boolean;
    registeredAt: number;
}

export function ProjectTable() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Execution Ledger...</div>;

    return (
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
                                <button className="text-white hover:text-purple-400 text-xs border border-white/20 hover:border-purple-400 rounded px-2 py-1 transition-colors">
                                    Audit Report
                                </button>
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
        </div>
    );
}
