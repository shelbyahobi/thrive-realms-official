'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Loader2, FolderKanban, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ProjectsList() {
    const { provider } = useWallet();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider) fetchProjects();
    }, [provider]);

    async function fetchProjects() {
        if (!provider) return;
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.PROJECT_REGISTRY, CONTRACT_ABIS.ProjectRegistry, provider);
            const currentBlock = await provider.getBlockNumber();
            const filter = registry.filters.ProjectCreated();

            const CHUNK_SIZE = 5000;
            const TOTAL_BLOCKS = 100000;
            let events: any[] = [];

            for (let i = 0; i < TOTAL_BLOCKS; i += CHUNK_SIZE) {
                const to = currentBlock - i;
                const from = Math.max(0, to - CHUNK_SIZE);
                try {
                    const chunk = await registry.queryFilter(filter, from, to);
                    events = [...events, ...chunk];
                } catch (e: any) {
                    console.warn(`Chunk failed ${from}-${to}:`, e.message);
                }
                if (from === 0) break;
            }

            const list = await Promise.all(events.map(async (e: any) => {
                const escrowAddress = e.args[0];
                const projectId = e.args[1];
                const executor = e.args[2];

                try {
                    const escrow = new ethers.Contract(escrowAddress, CONTRACT_ABIS.ProjectEscrow, provider);
                    const title = await escrow.title();
                    const category = await escrow.category();

                    return {
                        address: escrowAddress,
                        projectId,
                        executor,
                        title,
                        category
                    };
                } catch (err) {
                    return null;
                }
            }));
            setProjects(list.filter(p => p !== null));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Funded Mandates</h2>
                    <p className="text-gray-400">Initiatives successfully funded by Governance.</p>
                </div>
                <Link href="/proposals/new?type=project" className="btn btn-primary px-6 py-2">
                    <ShieldCheck size={18} className="mr-2" /> Propose Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 && (
                    <div className="col-span-full text-center p-12 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-500">No active projects yet.</p>
                    </div>
                )}

                {projects.map((p) => (
                    <Link key={p.address} href={`/projects/${p.address}`} className="glass-card p-6 hover:border-blue-500/50 transition group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded font-bold uppercase">
                                {p.category}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition">{p.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">Project ID: {p.projectId}</p>

                        <div className="flex items-center gap-2 text-sm text-gray-400 border-t border-white/5 pt-4">
                            <span>View Milestones</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
