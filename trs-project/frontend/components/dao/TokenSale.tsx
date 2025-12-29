'use client';
import { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { getReadProvider } from '../../lib/providers'; // New import

export default function TokenSale() {
    const { signer, provider, account, chainId } = useWallet();
    const [buyAmount, setBuyAmount] = useState('');
    const [price, setPrice] = useState('0');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const isWrongNetwork = chainId && chainId !== '97'; // 97 is BSC Testnet

    useEffect(() => {
        // ALWAYS fetch price on load, using fallback if needed
        fetchPrice();
    }, [provider, chainId]);

    async function fetchPrice() {
        // Use wallet provider OR fallback to public RPC
        const activeProvider = provider || getReadProvider();

        try {
            const sale = new ethers.Contract(CONTRACT_ADDRESSES.SALE, CONTRACT_ABIS.TRSSale, activeProvider);
            const p = await sale.getCurrentPrice();
            setPrice(formatEther(p));
            console.log("Fetched Price:", formatEther(p));
        } catch (e: any) {
            console.error("Price Fetch Error:", e);
            setPrice("Error");
        }
    }

    // Calc expected output
    const [estimatedOut, setEstimatedOut] = useState('0');

    useEffect(() => {
        if (!buyAmount || !price || price === '0' || price === 'Error') {
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
        if (!signer) {
            alert("Please connect your wallet via the 'Connect Wallet' button first.");
            return;
        }
        if (!buyAmount || parseFloat(buyAmount) <= 0) {
            alert("Please enter a valid amount of BNB.");
            return;
        }

        if (isWrongNetwork) {
            alert("Wrong Network! Switch to BSC Testnet (97).");
            return;
        }

        setLoading(true);
        setStatus("Processing transaction...");
        try {
            console.log("Buying tokens with", buyAmount, "BNB");
            const sale = new ethers.Contract(CONTRACT_ADDRESSES.SALE, CONTRACT_ABIS.TRSSale, signer);
            // Manual gas limit to bypass estimation errors
            const tx = await sale.buyTokens({ value: parseEther(buyAmount), gasLimit: 800000 });
            await tx.wait();
            setStatus("Success! Tokens purchased.");
            setBuyAmount('');
            alert("Tokens purchased successfully! Refreshing...");
            window.location.reload(); // Refresh to show new balance
        } catch (e: any) {
            console.error("Buy Error:", e);
            if (e.code === 'ACTION_REJECTED') {
                setStatus("Transaction rejected by user.");
                alert("You rejected the transaction.");
            } else if (e.message && e.message.includes("insufficient funds")) {
                setStatus("Error: Insufficient BNB for value + gas.");
                alert("Insufficient BNB in your wallet. (You need tBNB)");
            } else {
                setStatus("Failed: " + (e.reason || e.message || "Unknown Error"));
                alert("Transaction Failed. Check console for details.");
            }
        }
        setLoading(false);
    }

    // Only block the UI if we are DEFINITELY on wrong network and connected
    if (account && isWrongNetwork) {
        return (
            <div className="glass-card p-6 bg-red-900/20 border border-red-500/50">
                <h3 className="text-xl font-bold mb-2 text-white">Wrong Network</h3>
                <p className="text-sm text-gray-300 mb-4">
                    You are connected to Chain ID <span className="font-mono text-red-400">{chainId}</span>.
                    Please switch to **BSC Testnet** (Chain ID 97) to participate.
                </p>
            </div>
        );
    }

    // If not connected, show the UI (Read-Only) but buying will trigger alert

    return (
        <div className="glass-card p-6 bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4 text-white">Buy TRS Tokens</h3>
            <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-400">Current Price:</span>
                <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-mono">{price === '0' ? 'Loading...' : price} tBNB</span>
                    <button onClick={fetchPrice} className="text-gray-500 hover:text-white" title="Refresh Price">↻</button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold">Amount (tBNB)</label>
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
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : 'Buy TRS'}
                </button>

                {status && (
                    <div className={`text-xs text-center p-2 rounded ${status.includes("Success") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {status}
                    </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-2">
                    *Requires Testnet BNB (tBNB).
                    {!account && <span className="block text-amber-500 font-bold mt-1">Connect Wallet to Purchase</span>}
                </p>
            </div>
        </div>
    );
}
