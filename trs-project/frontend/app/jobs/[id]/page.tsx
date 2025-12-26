'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useWallet } from '../../../hooks/useWallet';
import { Loader2, CheckCircle, User, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function JobDetailPage() {
    const { id } = useParams();
    const { provider, signer, account } = useWallet();

    // State
    const [job, setJob] = useState<any>(null);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [isPoster, setIsPoster] = useState(false);

    useEffect(() => {
        if (id) fetchDetails();
    }, [id, provider, account]);

    async function fetchDetails() {
        try {
            const readProvider = provider || new ethers.JsonRpcProvider("https://bsc-testnet.publicnode.com");
            const jobRegistry = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, readProvider);
            const execRegistry = new ethers.Contract(CONTRACT_ADDRESSES.EXECUTION_REGISTRY, CONTRACT_ABIS.ExecutionRegistry, readProvider);

            const fetchedJob = await jobRegistry.getJob(id);
            const fetchedApps = await jobRegistry.getJobApplications(id);

            // Fetch Verification Status for Job Executor (if assigned)
            let executorVerified = false;
            if (fetchedJob.executor !== ethers.ZeroAddress) {
                executorVerified = await execRegistry.isVerified(fetchedJob.executor);
            }

            setJob({
                id: fetchedJob.id.toString(),
                poster: fetchedJob.poster,
                proposalId: fetchedJob.proposalId.toString(),
                title: fetchedJob.metadataURI.split('|')[0],
                desc: fetchedJob.metadataURI.split('|')[1],
                skills: fetchedJob.metadataURI.split('|')[2],
                budget: formatEther(fetchedJob.budget),
                executor: fetchedJob.executor,
                status: Number(fetchedJob.status),
                executorVerified
            });

            // Fetch Verification Status for All Applicants
            const appsList = await Promise.all(fetchedApps.map(async (a: any) => {
                const isVerified = await execRegistry.isVerified(a.applicant);
                return {
                    applicant: a.applicant,
                    info: a.metadataURI,
                    tier: Number(a.tier),
                    timestamp: Number(a.timestamp),
                    isVerified
                };
            }));
            setApplicants(appsList);

            if (account && fetchedJob.poster.toLowerCase() === account.toLowerCase()) {
                setIsPoster(true);
            } else {
                setIsPoster(false);
            }

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function apply() {
        if (!signer) return;
        setActionLoading(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, signer);
            const tx = await contract.applyForJob(id, coverLetter);
            await tx.wait();
            fetchDetails(); // Refresh
        } catch (e: any) {
            alert("Error: " + (e.reason || e.message));
        }
        setActionLoading(false);
    }

    async function assign(applicant: string) {
        if (!signer) return;
        setActionLoading(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, signer);
            const tx = await contract.assignExecutor(id, applicant);
            await tx.wait();
            fetchDetails();
        } catch (e: any) {
            alert("Error: " + (e.reason || e.message));
        }
        setActionLoading(false);
    }

    async function completeJob() {
        if (!signer) return;
        setActionLoading(true);
        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, signer);
            const tx = await contract.completeJob(id);
            await tx.wait();
            fetchDetails();
        } catch (e: any) {
            alert("Error: " + (e.reason || e.message));
        }
        setActionLoading(false);
    }

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;
    if (!job) return <div className="p-12 text-center">Job not found</div>;

    return (
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left: Job Details */}
            <div className="md:col-span-2 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
                    <div className="flex gap-4 text-sm text-gray-400">
                        <span>Proposal #{job.proposalId}</span>
                        <span>•</span>
                        <span>Posted by {job.poster.substring(0, 8)}...</span>
                        <span>•</span>
                        <span className={job.status === 0 ? "text-green-400" : job.status === 2 ? "text-blue-400 font-bold" : "text-gray-400"}>
                            {job.status === 0 ? "Open" : job.status === 1 ? "In Progress" : "Completed"}
                        </span>
                    </div>
                </div>

                <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Description</h3>
                    <p className="text-gray-300 whitespace-pre-line mb-6">{job.desc}</p>

                    <h4 className="font-bold text-white mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills?.split(',').map((s: string, i: number) => (
                            <span key={i} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm">
                                {s.trim()}
                            </span>
                        ))}
                    </div>

                    <div className="bg-black/30 p-4 rounded border border-gray-700">
                        <span className="text-gray-400 text-sm block">Compensation</span>
                        <span className="text-2xl font-bold text-white">{parseInt(job.budget).toLocaleString()} TRS</span>
                    </div>
                </div>
            </div>

            {/* Right: Action Panel */}
            <div className="space-y-6">
                {/* Apply Box */}
                {job.status === 0 && !isPoster && (
                    <div className="glass-card p-6 border-l-4 border-purple-500">
                        <h3 className="text-lg font-bold text-white mb-4">Apply for Job</h3>
                        <textarea
                            value={coverLetter}
                            onChange={e => setCoverLetter(e.target.value)}
                            placeholder="Paste your resume link or write a cover letter..."
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white text-sm mb-4 h-32"
                        />
                        <button
                            onClick={apply}
                            disabled={actionLoading}
                            className="btn btn-primary w-full"
                        >
                            {actionLoading ? "Submitting..." : "Submit Application"}
                        </button>
                    </div>
                )}

                {/* Executor Display */}
                {job.status !== 0 && (
                    <div className={`glass-card p-6 border-l-4 ${job.executorVerified ? 'border-green-500' : 'border-yellow-500'}`}>
                        <h3 className="text-lg font-bold text-white mb-2">Executor</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-black/40 p-2 rounded text-sm font-mono text-gray-300 truncate w-full">
                                {job.executor}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            {job.executorVerified ? (
                                <span className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">
                                    <ShieldCheck size={14} /> Verified for Payout
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded">
                                    <AlertTriangle size={14} /> Pending Verification
                                </span>
                            )}
                        </div>

                        {/* Complete Button (Only for Poster) */}
                        {isPoster && job.status === 1 && (
                            <div>
                                <button
                                    onClick={completeJob}
                                    disabled={actionLoading || !job.executorVerified}
                                    className={`w-full py-2 rounded font-bold text-sm flex justify-center items-center gap-2 ${job.executorVerified
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {actionLoading ? <Loader2 className="animate-spin" /> : "Complete Job"}
                                </button>
                                {!job.executorVerified && (
                                    <p className="text-xs text-red-400 mt-2 text-center">
                                        Cannot complete: Executor must be verified.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Status Badge */}
                        {job.status === 2 && (
                            <div className="text-center text-green-400 font-bold border border-green-500/30 bg-green-500/10 py-2 rounded">
                                Job Completed
                            </div>
                        )}
                    </div>
                )}

                {/* Founder Tools: Applicants */}
                {isPoster && (
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Applicants ({applicants.length})</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {applicants.length === 0 && <p className="text-gray-500 text-sm">No applications yet.</p>}

                            {applicants.map((app, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded border border-gray-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-purple-400" />
                                            <span className="text-sm font-mono text-gray-300">{app.applicant.substring(0, 6)}...</span>
                                            {/* Verification Badge */}
                                            {app.isVerified ? (
                                                <span title="Verified for Payout">
                                                    <ShieldCheck size={14} className="text-green-400" />
                                                </span>
                                            ) : (
                                                <span title="Not Verified">
                                                    <ShieldAlert size={14} className="text-gray-600" />
                                                </span>
                                            )}
                                        </div>
                                        {/* Tier Badge */}
                                        <span className={`text-xs px-2 py-0.5 rounded border ${app.tier === 3 ? "border-purple-500 text-purple-300 bg-purple-500/10" :
                                            app.tier === 2 ? "border-blue-500 text-blue-300 bg-blue-500/10" :
                                                "border-gray-500 text-gray-300"
                                            }`}>
                                            {app.tier === 3 ? "Founder" : app.tier === 2 ? "Voter" : "Member"}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-xs italic mb-3">"{app.info}"</p>

                                    {job.status === 0 && (
                                        <button
                                            onClick={() => assign(app.applicant)}
                                            disabled={actionLoading}
                                            className="w-full py-1 bg-green-600/20 hover:bg-green-600/40 text-green-300 text-xs rounded border border-green-600/30 transition-colors"
                                        >
                                            Accept & Assign
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
