import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { Coins, RefreshCw, Download, AlertCircle } from 'lucide-react';
import DividendArtifact from '../abi/DividendVault.json';
import TokenArtifact from '../abi/TRSToken.json';

export default function DividendDashboard({
    dividendAddress,
    tokenAddress,
    account
}: {
    dividendAddress: string,
    tokenAddress: string,
    account: string
}) {
    const [distributions, setDistributions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [earnings, setEarnings] = useState<string>("0");

    useEffect(() => {
        if (account && window.ethereum) {
            fetchData();
        }
    }, [account, dividendAddress]);

    async function fetchData() {
        if (!account) return;
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(dividendAddress, DividendArtifact.abi, signer);
            const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, signer);

            const count = await vault.getDistributionCount();
            const list = [];
            let totalUnclaimed = 0n;

            for (let i = 0; i < Number(count); i++) {
                // Struct: snapshotId, totalAmount, totalSupplyAtSnapshot
                const dist = await vault.distributions(i);
                const hasClaimed = await vault.hasClaimed(i, account);

                let myShare = 0n;
                if (!hasClaimed) {
                    const balanceAtSnap = await token.balanceOfAt(account, dist.snapshotId);
                    if (balanceAtSnap > 0n) {
                        // Share = (UserBal * TotalDist) / TotalSupply
                        myShare = (BigInt(balanceAtSnap) * BigInt(dist.totalAmount)) / BigInt(dist.totalSupplyAtSnapshot);
                    }
                }

                if (myShare > 0n) totalUnclaimed += myShare;

                list.push({
                    id: i,
                    snapshotId: dist.snapshotId.toString(),
                    totalAmount: ethers.formatEther(dist[1]),
                    date: "Distribution #" + (i + 1), // Block timestamp fetch is expensive
                    myShare: ethers.formatEther(myShare),
                    hasClaimed: hasClaimed,
                    canClaim: myShare > 0n
                });
            }

            setDistributions(list.reverse()); // Newest first
            setEarnings(ethers.formatEther(totalUnclaimed));
        } catch (e) {
            console.error("Dividend Fetch Error", e);
        }
    }

    async function claim(id: number) {
        setLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const vault = new ethers.Contract(dividendAddress, DividendArtifact.abi, signer);

            const tx = await vault.claim(id);
            await tx.wait();
            alert("Dividend Claimed!");
            fetchData();
        } catch (e: any) {
            alert("Claim Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    return (
        <div className="container mb-12">
            <div className="flex items-center gap-3 mb-6">
                <Coins className="text-yellow-400" size={32} />
                <div>
                    <h2 className="text-3xl mb-0 font-bold text-white">Profit Sharing Vault</h2>
                    <p className="text-sm text-gray-400">Dynamic dividends based on your historical snapshot holdings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Stats Card */}
                <div className="glass-card bg-gradient-to-br from-yellow-900/20 to-black/40 border-yellow-500/20 p-6">
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Unclaimed Dividends</h3>
                    <div className="text-4xl font-bold text-yellow-400 mb-4">{Number(earnings).toFixed(5)} BNB</div>
                    <button onClick={fetchData} className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>

                {/* Info Card */}
                <div className="glass-card p-6 flex flex-col justify-center">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-blue-400 shrink-0 mt-1" size={20} />
                        <p className="text-sm text-gray-300">
                            Snapshots are taken automatically when funds are deposited.
                            You must hold TRS tokens <strong>before</strong> the snapshot to receive dividends.
                        </p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="glass-card">
                <h3 className="text-xl mb-4 text-white">Distribution History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="text-xs uppercase bg-white/5 text-gray-300">
                            <tr>
                                <th className="p-3">Event</th>
                                <th className="p-3">Total Pot</th>
                                <th className="p-3">Snapshot ID</th>
                                <th className="p-3">Your Share</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {distributions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center italic text-gray-600">No distributions yet.</td>
                                </tr>
                            ) : distributions.map((d) => (
                                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-bold text-white">{d.date}</td>
                                    <td className="p-3 text-yellow-500">{Number(d.totalAmount).toFixed(2)} BNB</td>
                                    <td className="p-3 font-mono">{d.snapshotId}</td>
                                    <td className="p-3 text-green-400 font-bold">{Number(d.myShare).toFixed(5)} BNB</td>
                                    <td className="p-3 text-right">
                                        {d.hasClaimed ? (
                                            <span className="text-gray-500 flex items-center justify-end gap-1">
                                                <CheckCircle size={14} /> Claimed
                                            </span>
                                        ) : d.canClaim ? (
                                            <button
                                                onClick={() => claim(d.id)}
                                                disabled={loading}
                                                className="btn bg-green-500/20 text-green-400 hover:bg-green-500/30 py-1 px-3 text-xs"
                                            >
                                                Claim
                                            </button>
                                        ) : (
                                            <span className="text-gray-600 text-xs">Not Eligible</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Minimal icon stub if not imported globally, but I used lucide-react above.
function CheckCircle({ size }: { size: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>; }
