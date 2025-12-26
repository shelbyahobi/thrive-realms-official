'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Landmark } from 'lucide-react';
import Link from 'next/link';

export default function TreasuryWidget() {
    const { provider } = useWallet();
    const [stats, setStats] = useState({ bnb: '0', trs: '0' });

    useEffect(() => {
        if (provider) fetchData();
    }, [provider]);

    async function fetchData() {
        if (!provider) return;
        try {
            const bnb = await provider.getBalance(CONTRACT_ADDRESSES.TIMELOCK);
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const trs = await token.balanceOf(CONTRACT_ADDRESSES.TIMELOCK);
            setStats({
                bnb: formatEther(bnb),
                trs: formatEther(trs)
            });
        } catch (e) { console.error(e); }
    }

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between group hover:border-green-500/50 transition">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-green-500/10 p-2 rounded-lg">
                    <Landmark className="text-green-400" size={24} />
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Treasury</span>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-2xl font-bold text-white">{parseFloat(stats.bnb).toFixed(2)} BNB</p>
                    <p className="text-xs text-gray-500">Native Reserve</p>
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-300">{parseInt(stats.trs).toLocaleString()} TRS</p>
                    <p className="text-xs text-gray-500">Token Reserve</p>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
                <Link href="/governance" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 font-bold">
                    View Audit -&gt;
                </Link>
            </div>
        </div>
    );
}
