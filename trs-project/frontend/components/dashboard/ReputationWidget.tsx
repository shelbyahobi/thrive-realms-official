'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Shield, Activity, FileText, Vote, AlertTriangle, Zap, Loader2 } from 'lucide-react';

export default function ReputationWidget() {
    const { account, provider } = useWallet();
    const [scores, setScores] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isFastTrack, setIsFastTrack] = useState(false);

    useEffect(() => {
        if (account && provider) {
            fetchReputation();
        }
    }, [account, provider]);

    async function fetchReputation() {
        setLoading(true);
        try {
            const registry = new ethers.Contract(
                CONTRACT_ADDRESSES.REPUTATION_REGISTRY,
                CONTRACT_ABIS.ReputationRegistry,
                provider
            );

            // Fetch Score Struct
            const rep = await registry.getReputation(account);

            // Fetch Eligibility (Type 0 = Standard)
            const eligible = await registry.isFastTrackEligible(account, 0);

            setScores({
                execution: Number(rep.executionScore),
                reporting: Number(rep.reportingScore),
                governance: Number(rep.governanceScore),
                dispute: Number(rep.disputeScore),
                isFlagged: rep.isFlagged
            });
            setIsFastTrack(eligible);

        } catch (e) {
            console.error("Reputation Fetch Error", e);
        }
        setLoading(false);
    }

    if (!account) return (
        <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center opacity-50">
            <Shield size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">Connect Wallet</h3>
            <p className="text-sm text-gray-600">View your Reputation Score</p>
        </div>
    );

    if (loading) return (
        <div className="glass-card p-6 h-full flex justify-center items-center">
            <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
    );

    if (!scores) return (
        <div className="glass-card p-6 h-full flex flex-col justify-center items-center text-center">
            <Shield size={48} className="text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-white">No Reputation Data</h3>
            <p className="text-sm text-gray-400">Participate in projects to earn trust.</p>
        </div>
    );

    // Helpers for Score Color
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-400";
        if (score >= 70) return "text-blue-400";
        if (score >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield size={120} className="text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Shield size={20} className="text-purple-400" />
                            Reputation Score
                        </h2>
                        <p className="text-xs text-gray-500 font-mono">Institutional Trust Metric</p>
                    </div>
                    {isFastTrack ? (
                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                            <Zap size={12} fill="currentColor" /> FAST TRACK ELIGIBLE
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-gray-800 border border-white/10 text-gray-500 text-xs font-bold rounded">
                            Standard Tier
                        </span>
                    )}
                </div>

                {scores.isFlagged && (
                    <div className="mb-4 bg-red-900/20 border border-red-500/50 p-3 rounded flex items-start gap-3">
                        <AlertTriangle className="text-red-500 shrink-0" size={18} />
                        <div>
                            <p className="text-red-400 font-bold text-sm">Account Flagged</p>
                            <p className="text-red-300/70 text-xs">High-risk activity detected. Fast track is disabled.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    {/* Execution */}
                    <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Activity size={12} /> Execution</span>
                            <span className={`font-bold ${getScoreColor(scores.execution)}`}>{scores.execution}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${scores.execution}%` }}></div>
                        </div>
                    </div>

                    {/* Reporting */}
                    <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><FileText size={12} /> Reporting</span>
                            <span className={`font-bold ${getScoreColor(scores.reporting)}`}>{scores.reporting}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${scores.reporting}%` }}></div>
                        </div>
                    </div>

                    {/* Governance */}
                    <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Vote size={12} /> Governance</span>
                            <span className={`font-bold ${getScoreColor(scores.governance)}`}>{scores.governance}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${scores.governance}%` }}></div>
                        </div>
                    </div>

                    {/* Dispute (Risk) */}
                    <div className="bg-black/30 p-3 rounded border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1"><Shield size={12} /> Risk Score</span>
                            <span className={`font-bold ${getScoreColor(scores.dispute)}`}>{scores.dispute}/100</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500" style={{ width: `${scores.dispute}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1 text-right">Higher is Safer</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
