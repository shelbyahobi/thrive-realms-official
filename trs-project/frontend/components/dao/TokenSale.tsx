'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';

export default function TokenSale() {
    const { signer, provider, account } = useWallet();
    const [buyAmount, setBuyAmount] = useState('');
    const [price, setPrice] = useState('0');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (provider) fetchPrice();
    }, [provider]);

    async function fetchPrice() {
        if (!provider) return;
        try {
            const sale = new ethers.Contract(CONTRACT_ADDRESSES.SALE, CONTRACT_ABIS.TRSSale, provider);
            const p = await sale.getCurrentPrice();
            setPrice(formatEther(p));
        } catch (e) { console.error(e); }
    }

    // Calc expected output
    const [estimatedOut, setEstimatedOut] = useState('0');

    useEffect(() => {
        if (!buyAmount || !price || price === '0') {
            setEstimatedOut('0');
            return;
        }
        try {
            const val = parseEther(buyAmount);
            const p = parseEther(price);
            if (p > BigInt(0)) {
                const out = (val * BigInt(10 ** 18)) / p;
                setEstimatedOut(formatEther(out));
            }
        } catch (e) { }
    }, [buyAmount, price]);

    async function buyTokens() {
        if (!signer || !buyAmount) return;
        setLoading(true);
        setStatus("Processing transaction...");
        try {
            const sale = new ethers.Contract(CONTRACT_ADDRESSES.SALE, CONTRACT_ABIS.TRSSale, signer);
            // Manual gas limit to bypass estimation errors (often implies revert scenarios like Wallet Limit)
            // Increased to 800,000 to cover any complexity
            const tx = await sale.buyTokens({ value: parseEther(buyAmount), gasLimit: 800000 });
            await tx.wait();
            setStatus("Success! Tokens purchased.");
            setBuyAmount('');
            window.location.reload(); // Refresh to show new balance
        } catch (e: any) {
            console.error(e);
            if (e.code === 'ACTION_REJECTED') {
                setStatus("Transaction rejected by user.");
            } else if (e.message.includes("insufficient funds")) {
                setStatus("Error: Insufficient BNB for value + gas.");
            } else {
                setStatus("Failed: " + (e.reason || e.message || "Unknown Error"));
            }
        }
        setLoading(false);
    }

    if (!account) return null;

    return (
        <div className="glass-card p-6 bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4 text-white">Buy TRS Tokens</h3>
            <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-400">Current Price:</span>
                <span className="text-purple-400 font-mono">{price} BNB</span>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Amount (BNB)</label>
                    <input
                        type="number"
                        value={buyAmount}
                        onChange={e => setBuyAmount(e.target.value)}
                        placeholder="0.1"
                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 outline-none transition"
                    />
                    {buyAmount && (
                        <div className="text-right mt-2 text-xs">
                            <span className="text-gray-500">Estimated Receive: </span>
                            <span className="text-white font-bold">{parseFloat(estimatedOut).toLocaleString()} TRS</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={buyTokens}
                    disabled={loading}
                    className="w-full btn bg-purple-600 hover:bg-purple-700 text-white py-3 font-bold rounded shadow-lg shadow-purple-900/20"
                >
                    {loading ? "Buying..." : "Purchase Tokens"}
                </button>
                {status && <p className="text-xs text-center text-gray-300 bg-white/5 p-2 rounded">{status}</p>}
            </div>
        </div>
    );
}
