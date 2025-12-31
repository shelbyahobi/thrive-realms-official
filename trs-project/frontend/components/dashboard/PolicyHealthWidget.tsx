'use client';

import { Activity, CheckCircle, AlertOctagon, RefreshCw } from 'lucide-react';

export default function PolicyHealthWidget() {
    // Mock Data for Phase 4 Demo (Real data would come from subgraph/indexer)
    const healthData = {
        status: "Normal", // Normal, Warning, Critical
        uptime: "99.9%",
        activePods: 12,
        disputeRate: "0.4%", // < 1% is good
        pendingAudits: 3,
        lastCheck: "Just now"
    };

    const getStatusColor = (status: string) => {
        if (status === "Normal") return "text-green-500";
        if (status === "Warning") return "text-yellow-500";
        return "text-red-500";
    };

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            {/* Pulse Effect */}
            <div className="absolute top-4 right-4 animate-pulse">
                <div className="h-3 w-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <Activity size={24} className="text-green-400" />
                    <div>
                        <h2 className="text-lg font-bold text-white">Policy Health</h2>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-mono font-bold uppercase ${getStatusColor(healthData.status)}`}>
                                System {healthData.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Metric Row */}
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Active Execution Pods</span>
                        <span className="text-white font-mono font-bold">{healthData.activePods}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Dispute Rate (30d)</span>
                        <div className="text-right">
                            <span className="text-green-400 font-mono font-bold block">{healthData.disputeRate}</span>
                            <span className="text-[10px] text-gray-500">Target: &lt;1.0%</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-gray-400 text-sm">Pending Audits</span>
                        <span className="text-yellow-400 font-mono font-bold">{healthData.pendingAudits}</span>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/20 p-3 rounded mt-4 flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-400" />
                        <span className="text-green-300 text-xs">All automated checks passing. Timelock strictness enabled.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
