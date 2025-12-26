'use client';

import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { ExternalLink, Copy, PieChart } from 'lucide-react';

export default function TreasuryPage() {
    const { provider } = useWallet();
    const [bnbBalance, setBnbBalance] = useState('0');
    const [tokenBalance, setTokenBalance] = useState('0');

    useEffect(() => {
        if (provider) fetchData();
    }, [provider]);

    async function fetchData() {
        if (!provider) return;
        try {
            // BNB Balance
            const bal = await provider.getBalance(CONTRACT_ADDRESSES.TIMELOCK);
            setBnbBalance(formatEther(bal));

            // TRS Balance
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const tBal = await token.balanceOf(CONTRACT_ADDRESSES.TIMELOCK);
            setTokenBalance(formatEther(tBal));
        } catch (e) { console.error(e); }
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <PieChart className="text-purple-500" />
                Treasury Transparency
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* On-Chain Wallets */}
                <div className="glass-card p-8 bg-gradient-to-br from-gray-900 to-black">
                    <h3 className="text-gray-400 uppercase text-xs font-bold mb-4 tracking-wider">DAO Treasury (Timelock)</h3>
                    <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded font-mono text-sm break-all">
                        {CONTRACT_ADDRESSES.TIMELOCK}
                        <Copy size={14} className="cursor-pointer hover:text-white text-gray-500" />
                        <ExternalLink size={14} className="cursor-pointer hover:text-white text-gray-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-2xl font-bold text-white">{parseFloat(bnbBalance).toFixed(4)} BNB</p>
                            <p className="text-xs text-gray-500">Native Asset Reserve</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{parseFloat(tokenBalance).toLocaleString()} TRS</p>
                            <p className="text-xs text-gray-500">Governance Token Reserve</p>
                        </div>
                    </div>
                </div>

                {/* Allocation Chart (Mock) */}
                <div className="glass-card p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-48 h-48 rounded-full border-8 border-purple-500/20 flex items-center justify-center mx-auto mb-4 relative">
                            {/* Simple CSS Pie Chart Mock */}
                            <div className="text-white font-bold text-xl">100%</div>
                        </div>
                        <p className="text-gray-400">Funds Unallocated</p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
                <p className="text-gray-500 italic">No outgoing transactions executed by DAO yet.</p>
            </div>
        </div>
    );
}
