'use client';

import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ABIS } from '../../lib/contracts';
import { Loader2, Coins, Calendar, CheckCircle } from 'lucide-react';

interface DividendDashboardProps {
    dividendAddress: string;
    tokenAddress: string;
    account: string;
}

export default function DividendDashboard({ dividendAddress, tokenAddress, account }: DividendDashboardProps) {
    const [distributions, setDistributions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [unclaimedTotal, setUnclaimedTotal] = useState('0');

    useEffect(() => {
        if (account && window.ethereum) {
            fetchData();
        }
    }, [account, dividendAddress]);

    async function fetchData() {
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const vault = new ethers.Contract(dividendAddress, CONTRACT_ABIS.DividendVault, provider);
            const token = new ethers.Contract(tokenAddress, CONTRACT_ABIS.TRSToken, provider);

            const count = await vault.getDistributionCount();
            let totalUnclaimed = BigInt(0);
            const list = [];

            // Iterate backwards (latest first)
            for (let i = Number(count) - 1; i >= 0; i--) {
                const distId = i;

                // distributions(i) returns [snapshotId, totalAmount, totalSupplyAtSnapshot]
                const distStruct = await vault.distributions(i);

                const snapshotId = distStruct[0];
                const totalAmount = distStruct[1];
                const totalSupply = distStruct[2];

                const hasClaimed = await vault.hasClaimed(distId, account);

                // Calculate user share
                const balanceAtSnapshot = await token.balanceOfAt(account, snapshotId);
                let userShare = BigInt(0);

                const supplyBI = BigInt(totalSupply);
                const amountBI = BigInt(totalAmount);
                const balanceBI = BigInt(balanceAtSnapshot);

                if (supplyBI > BigInt(0)) {
                    userShare = (amountBI * balanceBI) / supplyBI;
                }

                if (!hasClaimed && userShare > BigInt(0)) {
                    totalUnclaimed += userShare;
                }

                list.push({
                    id: distId.toString(),
                    amount: formatEther(totalAmount),
                    snapshotId: snapshotId.toString(),
                    userShare: formatEther(userShare),
                    hasClaimed,
                    timestamp: "Block " + snapshotId.toString()
                });
            }

            setDistributions(list);
            setUnclaimedTotal(formatEther(totalUnclaimed));
        } catch (e) {
            console.error("Dividend Fetch Error", e);
        }
        setLoading(false);
    }

    async function claim(id: string) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(dividendAddress, CONTRACT_ABIS.DividendVault, signer);
            const tx = await vault.claim(id);
            await tx.wait();
            alert("Dividends Claimed!");
            fetchData();
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.reason || e.message));
        }
    }

    return (
        <div className="w-full">
            {loading && <div className="text-center py-4"><Loader2 className="animate-spin text-purple-500 mx-auto" /></div>}

            {!loading && distributions.length === 0 && (
                <div className="text-center py-8 text-gray-500 italic">No historical distributions found.</div>
            )}

            <div className="space-y-0 divide-y divide-white/5">
                {distributions.map((d) => (
                    <div key={d.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 text-green-400 p-2 rounded-full">
                                <Coins size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">Distribution #{d.id}</h4>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={10} /> Snapshot: {d.snapshotId}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-sm font-bold text-white mb-1">
                                {Number(d.userShare) > 0 ? (
                                    <span className="text-green-400">+{parseFloat(d.userShare).toFixed(4)} BNB</span>
                                ) : (
                                    <span className="text-gray-600">0 BNB</span>
                                )}
                            </div>

                            {d.hasClaimed ? (
                                <span className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                                    <CheckCircle size={10} /> Claimed
                                </span>
                            ) : Number(d.userShare) > 0 ? (
                                <button onClick={() => claim(d.id)} className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded font-bold">
                                    CLAIM
                                </button>
                            ) : (
                                <span className="text-xs text-gray-600">Not Eligible</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
