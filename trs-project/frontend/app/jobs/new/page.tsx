'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '../../../hooks/useWallet';
import { ethers, parseEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase } from 'lucide-react';

export default function PostJobPage() {
    const { signer, account } = useWallet();
    const router = useRouter();

    // Form
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [skills, setSkills] = useState('');
    const [proposalId, setProposalId] = useState('');
    const [budget, setBudget] = useState('');

    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFounder, setIsFounder] = useState(false);

    useEffect(() => {
        if (account) checkTier();
    }, [account]);

    async function checkTier() {
        if (!account || !window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
        const bal = await token.balanceOf(account);
        // 24,000 TRS
        if (bal >= BigInt("24000000000000000000000")) {
            setIsFounder(true);
        }
    }

    async function postJob() {
        if (!signer) return;
        setLoading(true);
        setStatus("Creating Job...");

        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.JOB_REGISTRY, CONTRACT_ABIS.JobRegistry, signer);

            // Hack for MVP Metadata: "Title|Desc|Skills"
            const metadata = `${title}|${desc}|${skills}`;

            // Payment Token = Token Address (TRS)
            const paymentToken = CONTRACT_ADDRESSES.TOKEN;

            const tx = await contract.postJob(proposalId, metadata, parseEther(budget), paymentToken);
            setStatus("Wait for confirmation...");
            await tx.wait();

            router.push('/jobs');
        } catch (e: any) {
            console.error(e);
            setStatus("Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    if (!account) return <div className="p-12 text-center text-gray-500">Connect Wallet</div>;

    if (account && !isFounder) return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="glass-card max-w-md mx-auto p-12 border-l-4 border-red-500">
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-gray-400">Only <strong>Founders</strong> (24k+ TRS) can post jobs.</p>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
                <Briefcase className="text-purple-400" /> Post New Job
            </h1>

            <div className="glass-card p-8 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Linked Proposal ID *</label>
                    <input
                        type="number"
                        placeholder="e.g. 1"
                        value={proposalId}
                        onChange={e => setProposalId(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">Job must be authorized by a governance proposal.</p>
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Job Title *</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none h-32"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Budget (TRS)</label>
                        <input
                            type="number"
                            value={budget}
                            onChange={e => setBudget(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Required Skills</label>
                        <input
                            type="text"
                            value={skills}
                            onChange={e => setSkills(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={postJob}
                        disabled={loading || !title || !proposalId}
                        className="btn btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Publish Job"}
                    </button>
                    {status && <p className="text-center text-sm mt-4 text-purple-300 animate-pulse">{status}</p>}
                </div>
            </div>
        </div>
    );
}
