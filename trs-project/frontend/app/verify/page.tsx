'use client';
import { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function VerifyPage() {
    const { signer, account } = useWallet();
    const [targetAddress, setTargetAddress] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    async function toggleVerification(verifying: boolean) {
        if (!signer || !targetAddress) return;
        setLoading(true);
        setStatus(verifying ? "Verifying..." : "Revoking...");

        try {
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.EXECUTION_REGISTRY, CONTRACT_ABIS.ExecutionRegistry, signer);
            const tx = await contract.setVerified(targetAddress, verifying);
            await tx.wait();
            setStatus(verifying ? "Address Verified!" : "Verification Revoked.");
        } catch (e: any) {
            console.error(e);
            setStatus("Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="text-green-400" /> Execution Verification
            </h1>
            <p className="text-gray-400 mb-8">
                Manage Payout Eligibility. Required for executors to receive funds.
                <br /><small className="text-yellow-500">Restricted to Founders/Timelock.</small>
            </p>

            <div className="glass-card p-8 space-y-6">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Executor Wallet Address</label>
                    <input
                        type="text"
                        value={targetAddress}
                        onChange={e => setTargetAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-black/40 border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none font-mono"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button
                        onClick={() => toggleVerification(true)}
                        disabled={loading || !targetAddress}
                        className="btn bg-green-600 hover:bg-green-700 text-white flex justify-center items-center gap-2 py-3 rounded"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Grant Verified Status</>}
                    </button>

                    <button
                        onClick={() => toggleVerification(false)}
                        disabled={loading || !targetAddress}
                        className="btn bg-red-600 hover:bg-red-700 text-white flex justify-center items-center gap-2 py-3 rounded"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><ShieldAlert size={18} /> Revoke Status</>}
                    </button>
                </div>

                {status && (
                    <div className="text-center p-4 bg-white/5 rounded border border-gray-700 mt-4">
                        <p className={status.includes("Failed") ? "text-red-400" : "text-green-400"}>{status}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
