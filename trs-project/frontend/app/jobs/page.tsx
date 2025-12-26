'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import Link from 'next/link';
import { Loader2, Briefcase, Plus, Building2 } from 'lucide-react';

interface Job {
    id: string;
    poster: string;
    proposalId: string;
    metadataURI: string; // "Title|Desc|Skills" for MVP
    budget: string;
    executor: string;
    status: number; // 0=Open, 1=Filled
}

export default function JobsPage() {
    const { provider, account } = useWallet();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [myApps, setMyApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'open' | 'my'>('open');

    useEffect(() => {
        fetchJobs();
    }, []);

    async function fetchJobs() {
        setLoading(true);
        try {
            // Use Public Node for reading events (Reliability Fix)
            const READ_RPC = "https://bsc-testnet.publicnode.com";
            const readProvider = new ethers.JsonRpcProvider(READ_RPC);
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, readProvider);

            const latestBlock = await readProvider.getBlockNumber();
            const filter = registry.filters.JobPosted();

            // Fetch interactions (Scan last 50k blocks - fresh deployment)
            const events = await registry.queryFilter(filter, latestBlock - 50000, "latest");

            const list: Job[] = [];
            for (const e of events) {
                const args = (e as any).args;
                const id = args[0];
                // Fetch current state
                const jobStruct = await registry.jobs(id);

                // Parse Metadata (Mock: "Title|Desc" since we don't have IPFS yet)
                // Real app: fetch(metadataURI)

                list.push({
                    id: id.toString(),
                    poster: args[1],
                    proposalId: args[2].toString(),
                    metadataURI: jobStruct.metadataURI,
                    budget: formatEther(jobStruct.budget),
                    executor: jobStruct.executor,
                    status: Number(jobStruct.status)
                });
            }
            setJobs(list.reverse()); // Newest first
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">DAO Job Board</h1>
                    <p className="text-gray-400">Execute approved proposals and earn TRS.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/companies/register" className="btn btn-secondary flex items-center gap-2">
                        <Building2 size={18} /> Register Company
                    </Link>
                    <Link href="/jobs/new" className="btn btn-primary flex items-center gap-2">
                        <Plus size={18} /> Post Job
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-800 mb-8">
                <button
                    onClick={() => setActiveTab('open')}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'open' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-white'}`}
                >
                    Open Jobs
                </button>
                <button
                    onClick={() => setActiveTab('my')}
                    className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'my' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-white'}`}
                >
                    My Applications
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>
            ) : (
                <div className="grid gap-6">
                    {jobs.length === 0 && (
                        <div className="text-center py-12 glass-card opacity-50">
                            <p className="text-xl text-gray-400 mb-2">No jobs available.</p>
                            <p className="text-sm">Founders can create jobs from approved proposals.</p>
                        </div>
                    )}

                    {jobs.map(job => (
                        <div key={job.id} className="glass-card hover:border-purple-500/30 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                                        {job.metadataURI.split('|')[0] || "Untitled Job"}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Linked to Proposal #{job.proposalId} • Posted by {job.poster.substring(0, 6)}...
                                    </p>
                                    <div className="flex gap-2 text-xs">
                                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                            Budget: {parseInt(job.budget).toLocaleString()} TRS
                                        </span>
                                        {job.status === 0 ? (
                                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded">Open</span>
                                        ) : (
                                            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded">Filled by {job.executor.substring(0, 6)}...</span>
                                        )}
                                    </div>
                                </div>
                                <Link href={`/jobs/${job.id}`} className="btn btn-secondary text-sm">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
