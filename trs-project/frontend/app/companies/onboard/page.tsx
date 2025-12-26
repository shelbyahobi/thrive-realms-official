'use client';
import { useState } from 'react';
import { useWallet } from '../../../hooks/useWallet';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useRouter } from 'next/navigation';
import { Loader2, Building2 } from 'lucide-react';

export default function CompanyOnboardPage() {
    const { signer, account } = useWallet();
    const router = useRouter();

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [services, setServices] = useState('');
    const [website, setWebsite] = useState('');

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    async function register() {
        if (!signer || !name) return;
        setLoading(true);
        setStatus("Confirming transaction...");

        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, signer);

            // Hack for MVP Metadata: "Description|Services|Website"
            const metadata = `${desc}|${services}|${website}`;

            const tx = await contract.registerCompany(name, metadata);
            setStatus("Wait for confirmation...");
            await tx.wait();

            router.push('/jobs'); // Redirect to Jobs board
        } catch (e: any) {
            console.error(e);
            setStatus("Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <Building2 className="text-purple-400" /> Company Onboarding
            </h1>
            <p className="text-gray-400 mb-8">
                Register as an official DAO Execution Entity. Build reputation and get paid directly on-chain.
            </p>

            <div className="glass-card p-8 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none h-24"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Services Offered</label>
                        <input
                            type="text"
                            placeholder="e.g. Design, Dev, Marketing"
                            value={services}
                            onChange={e => setServices(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Website</label>
                        <input
                            type="text"
                            value={website}
                            onChange={e => setWebsite(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={register}
                        disabled={loading || !name}
                        className="btn btn-primary w-full flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Register Company"}
                    </button>
                    {status && <p className="text-center text-sm mt-4 text-purple-300 animate-pulse">{status}</p>}
                </div>
            </div>
        </div>
    );
}
