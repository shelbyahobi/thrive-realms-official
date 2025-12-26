'use client';
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { Loader2, Coins, History, ArrowDownCircle } from 'lucide-react';

export default function DividendsPage() {
    const { provider, signer, account } = useWallet();
    const [distributions, setDistributions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [stats, setStats] = useState({ totalDistributed: "0", myClaims: "0" });

    useEffect(() => {
        if (provider) fetchData();
    }, [provider, account]);

    async function fetchData() {
        try {
            const vault = new ethers.Contract(CONTRACT_ADDRESSES.DIVIDEND_VAULT, CONTRACT_ABIS.DividendVault, provider);
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);

            const count = await vault.getDistributionCount();
            const totalDist = await vault.totalDividendsDistributed();

            // If account is connected, check claims
            let myClaimedTotal = BigInt(0);

            const list = [];
            for (let i = 0; i < Number(count); i++) {
                const dist = await vault.distributions(i);
                const snapshotId = dist.snapshotId;

                let myShare = BigInt(0);
                let claimed = false;
                let balanceAtSnapshot = BigInt(0);

                if (account) {
                    claimed = await vault.hasClaimed(i, account);
                    balanceAtSnapshot = await token.balanceOfAt(account, snapshotId);

                    if (balanceAtSnapshot > BigInt(0)) {
                        myShare = (balanceAtSnapshot * dist.totalAmount) / dist.totalSupplyAtSnapshot;
                    }
                    if (claimed) {
                        myClaimedTotal += myShare;
                    }
                }

                list.push({
                    id: i,
                    snapshotId: snapshotId.toString(),
                    totalAmount: formatEther(dist.totalAmount),
                    myBalance: formatEther(balanceAtSnapshot),
                    myShare: formatEther(myShare),
                    myShareRaw: myShare,
                    claimed
                });
            }

            setDistributions(list.reverse()); // Newest first
            setStats({
                totalDistributed: formatEther(totalDist),
                myClaims: formatEther(myClaimedTotal)
            });

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function claim(id: number) {
        if (!signer) return;
        setClaimingId(id);
        try {
            const vault = new ethers.Contract(CONTRACT_ADDRESSES.DIVIDEND_VAULT, CONTRACT_ABIS.DividendVault, signer);
            const tx = await vault.claim(id);
            await tx.wait();
            fetchData();
        } catch (e: any) {
            alert("Claim Failed: " + (e.reason || e.message));
        }
        setClaimingId(null);
    }

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <Coins className="text-yellow-400" /> Revenue Sharing
            </h1>
            <p className="text-gray-400 mb-8">
                Claim your share of DAO revenue. Dividends are distributed to TRS holders based on snapshots.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="glass-card p-6 border-l-4 border-yellow-500">
                    <span className="text-gray-400 text-sm">Total Revenue Distributed</span>
                    <div className="text-2xl font-bold text-white">{stats.totalDistributed} BNB</div>
                </div>
                <div className="glass-card p-6 border-l-4 border-green-500">
                    <span className="text-gray-400 text-sm">My Total Claimed</span>
                    <div className="text-2xl font-bold text-white">{stats.myClaims} BNB</div>
                </div>
            </div>

            {/* Distributions List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <History size={20} /> Distribution History
                </h2>

                {distributions.length === 0 && (
                    <div className="text-center p-8 bg-white/5 rounded text-gray-400">
                        No distributions yet.
                    </div>
                )}

                {distributions.map((d) => (
                    <div key={d.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-white">Distribution #{d.id}</span>
                                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">Snap #{d.snapshotId}</span>
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                                <p>Total Pool: <span className="text-white">{d.totalAmount} BNB</span></p>
                                <p>Your Balance: <span className="text-white">{parseFloat(d.myBalance).toLocaleString()} TRS</span></p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="block text-gray-400 text-xs mb-1">Your Share</span>
                            <span className="block text-xl font-bold text-yellow-400 mb-2">
                                {Number(d.myShare) > 0 ? parseFloat(d.myShare).toFixed(4) : "0.00"} BNB
                            </span>

                            {d.claimed ? (
                                <button disabled className="px-4 py-2 bg-green-900/40 text-green-400 border border-green-800 rounded text-sm font-bold opacity-70">
                                    Claimed
                                </button>
                            ) : Number(d.myShareRaw) > 0 ? (
                                <button
                                    onClick={() => claim(d.id)}
                                    disabled={claimingId === d.id}
                                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-bold shadow-lg shadow-yellow-900/20 flex items-center gap-2"
                                >
                                    {claimingId === d.id ? <Loader2 className="animate-spin" size={16} /> : <><ArrowDownCircle size={16} /> Claim</>}
                                </button>
                            ) : (
                                <button disabled className="px-4 py-2 bg-gray-800 text-gray-500 rounded text-sm cursor-not-allowed">
                                    Not Eligible
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
