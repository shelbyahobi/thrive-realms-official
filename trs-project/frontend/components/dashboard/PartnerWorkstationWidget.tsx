'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Briefcase, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Link from 'next/link';

interface MyProject {
    id: string;
    escrow: string;
    title: string; // We might need to fetch this from contract or just show ID
    balance: string;
}

export default function PartnerWorkstationWidget() {
    const { provider, address } = useWallet();
    const [projects, setProjects] = useState<MyProject[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (address && provider) {
            fetchMyProjects();
        }
    }, [address, provider]);

    async function fetchMyProjects() {
        setLoading(true);
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.PROJECT_REGISTRY, CONTRACT_ABIS.ProjectRegistry, provider);
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);

            // Filter ProjectCreated events where executor is the 3rd arg (but it's not indexed in ABI? Let's check)
            // Looking at ABI: event ProjectCreated(address indexed escrow, string projectId, address executor);
            // Executor is NOT indexed. So we must fetch all and filter.

            // Use public RPC for better reliability if available
            const readProvider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL || "https://bsc-testnet.publicnode.com");
            const readRegistry = registry.connect(readProvider);

            const filter = registry.filters.ProjectCreated();
            const latestBlock = await readProvider.getBlockNumber();
            // Scan last 50k blocks roughly
            const events = await readRegistry.queryFilter(filter, Math.max(0, latestBlock - 50000), latestBlock);

            const myProjs: MyProject[] = [];

            for (const e of events) {
                const args = (e as any).args;
                const executor = args.executor; // args[2]

                if (executor.toLowerCase() === address?.toLowerCase()) {
                    const escrowAddr = args.escrow;
                    const pid = args.projectId;

                    // Fetch balance of escrow
                    const bal = await token.balanceOf(escrowAddr);

                    myProjs.push({
                        id: pid,
                        escrow: escrowAddr,
                        title: `Project ${pid}`, // Ideally fetch title from registry if possible
                        balance: ethers.formatEther(bal)
                    });
                }
            }
            setProjects(myProjs);

        } catch (e) {
            console.error("Error fetching projects", e);
        } finally {
            setLoading(false);
        }
    }

    if (!address) return null; // Don't show if no wallet
    if (projects.length === 0 && !loading) return null; // Don't show if no projects (unless we want an empty state)

    return (
        <div className="glass-card p-6 h-full flex flex-col group hover:border-blue-500/50 transition">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                    <Briefcase className="text-blue-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Partner Workstation</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-60 custom-scrollbar space-y-3">
                {loading ? (
                    <p className="text-sm text-gray-500 animate-pulse">Scanning mandates...</p>
                ) : (
                    projects.map(p => (
                        <div key={p.escrow} className="bg-white/5 p-3 rounded border border-white/5 hover:border-blue-500/30 transition">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-sm text-white">{p.title}</span>
                                <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">
                                    {parseFloat(p.balance).toFixed(0)} TRS
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <Link
                                    href={`/projects/${p.escrow}`}
                                    className="flex items-center justify-center gap-1 bg-green-600/20 text-green-400 py-1.5 rounded hover:bg-green-600/30 transition"
                                >
                                    <ArrowDownLeft size={12} /> Claim
                                </Link>
                                <button className="flex items-center justify-center gap-1 bg-purple-600/20 text-purple-400 py-1.5 rounded hover:bg-purple-600/30 transition opacity-50 cursor-not-allowed" title="Coming Soon">
                                    <ArrowUpRight size={12} /> Dividend
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {!loading && projects.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                    No active mandates found.
                </div>
            )}
        </div>
    );
}
