"use client";
import React, { useEffect, useState } from 'react';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts';
import { useWallet } from '@/hooks/useWallet';
import { Star, MessageSquare, MapPin, DollarSign, User, ExternalLink, Loader2, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface Opportunity {
    id: number;
    submitter: string;
    name: string;
    country: string;
    fundingAsk: string;
    contactInfo: string;
    ipfsHash: string; // JSON metadata
    createdAt: number;
    totalScore: number;
    reviewCount: number;
}

interface Review {
    reviewer: string;
    score: number;
    comment: string;
    timestamp: number;
}

export default function VaultPage() {
    const { signer, account } = useWallet();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    // Review Modal
    const [reviewingOp, setReviewingOp] = useState<Opportunity | null>(null);
    const [score, setScore] = useState(80);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window.ethereum === 'undefined') return;
        fetchVault();
    }, [account]);

    async function fetchVault() {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const vault = new ethers.Contract(
                CONTRACT_ADDRESSES.VAULT,
                CONTRACT_ABIS.OpportunityRegistry,
                provider
            );

            const rawOps = await vault.getAllOpportunities();
            const formatted = rawOps.map((op: any) => ({
                id: Number(op.id),
                submitter: op.submitter,
                name: op.name,
                country: op.country,
                fundingAsk: op.fundingAsk,
                contactInfo: op.contactInfo,
                ipfsHash: op.ipfsHash,
                createdAt: Number(op.createdAt),
                totalScore: Number(op.totalScore),
                reviewCount: Number(op.reviewCount)
            }));

            // Sort by newest
            setOpportunities(formatted.reverse());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function submitReview() {
        if (!signer || !reviewingOp) return;
        setSubmitting(true);
        try {
            const vault = new ethers.Contract(
                CONTRACT_ADDRESSES.VAULT,
                CONTRACT_ABIS.OpportunityRegistry,
                signer
            );

            const tx = await vault.reviewOpportunity(reviewingOp.id, score, comment);
            await tx.wait();

            alert("Review submitted on-chain!");
            setReviewingOp(null);
            setScore(80);
            setComment('');
            fetchVault(); // Refresh
        } catch (e) {
            console.error(e);
            alert("Review failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600 mb-4">
                        Intelligence Vault
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Review, Audit, and Rate incoming business opportunities.
                        Top-rated submissions are promoted to Governance Voting.
                    </p>
                </header>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <Loader2 className="animate-spin mb-4" />
                        Loading Vault Data...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {opportunities.map((op) => {
                            const avgScore = op.reviewCount > 0 ? (op.totalScore / op.reviewCount).toFixed(1) : 'N/A';
                            // Try parsing metadata
                            let metadata = { summary: '', video: '' };
                            try { metadata = JSON.parse(op.ipfsHash); } catch { }

                            return (
                                <div key={op.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-amber-500/30 transition-colors flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white line-clamp-1">{op.name}</h3>
                                        <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded border border-amber-500/30">
                                            #{op.id}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <MapPin size={14} className="text-gray-500" />
                                            {op.country}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <DollarSign size={14} className="text-gray-500" />
                                            Ask: <span className="text-white">{op.fundingAsk}</span>
                                        </div>
                                        <div className="bg-black/40 rounded p-3 text-sm text-gray-300 line-clamp-3">
                                            {metadata.summary || "No summary provided."}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                                        <div className="text-xs">
                                            <div className="text-gray-500 mb-1">Community Score</div>
                                            <div className="flex items-center gap-1 text-lg font-bold text-white">
                                                <Star className="text-amber-500 fill-amber-500 w-4 h-4" />
                                                {avgScore} <span className="text-gray-500 text-xs font-normal">({op.reviewCount} reviews)</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setReviewingOp(op)}
                                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && opportunities.length === 0 && (
                    <div className="text-center py-20 text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
                        No opportunities submittted yet. Go to <a href="/opportunities" className="text-amber-400 hover:underline">Opportunities</a> to add one.
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewingOp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-white/10 rounded-xl p-6 w-full max-w-md relative shadow-2xl">
                        <button
                            onClick={() => setReviewingOp(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-xl font-bold text-white mb-2">Review Opportunity</h3>
                        <p className="text-sm text-gray-400 mb-6">Rating <span className="text-amber-400">{reviewingOp.name}</span></p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0" max="100"
                                    value={score}
                                    onChange={(e) => setScore(Number(e.target.value))}
                                    className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">Comment</label>
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Your analysis..."
                                    className="w-full bg-black border border-white/20 rounded p-2 text-white outline-none focus:border-amber-500"
                                />
                            </div>
                            <button
                                onClick={submitReview}
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                {submitting ? 'Submitting...' : 'Submit Rating'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
