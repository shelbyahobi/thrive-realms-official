'use client';

import { TrendingUp, Banknote, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function CapitalModels() {
    return (
        <section className="py-20 border-t border-white/10">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-serif text-white mb-4">Capital Allocation Models</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Thrive Realms allocates capital via strict on-chain agreements. The model is chosen based on the asset class and risk profile.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Equity Model */}
                <div className="bg-gradient-to-b from-purple-900/10 to-black border border-purple-500/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <TrendingUp size={64} className="text-purple-500/10" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Equity / Ownership</h3>
                    </div>
                    <p className="text-gray-400 mb-8 leading-relaxed h-24">
                        The DAO acquires tokenized equity or profit-sharing rights in the operating entity. Best for high-growth ventures or new infrastructure.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-purple-500 mt-1" />
                            <span className="text-sm text-gray-300">DAO capturing long-term upside</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-purple-500 mt-1" />
                            <span className="text-sm text-gray-300">High alignment with Executor</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <AlertTriangle size={18} className="text-yellow-500 mt-1" />
                            <span className="text-sm text-gray-300">Higher risk profile</span>
                        </li>
                    </ul>
                    <div className="text-xs text-gray-500 bg-black/40 p-3 rounded border border-white/5">
                        <strong>Example:</strong> Taking a 15% stake in a new Bio-Plastics manufacturing facility.
                    </div>
                </div>

                {/* Debt Model */}
                <div className="bg-gradient-to-b from-blue-900/10 to-black border border-blue-500/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <Banknote size={64} className="text-blue-500/10" />
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                            <Banknote size={24} />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Debt / Revenue Share</h3>
                    </div>
                    <p className="text-gray-400 mb-8 leading-relaxed h-24">
                        Capital is provided as a loan with fixed repayment terms or a claim on future revenue. Executor retains full ownership.
                    </p>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-blue-500 mt-1" />
                            <span className="text-sm text-gray-300">Predictable cash flow for Treasury</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-blue-500 mt-1" />
                            <span className="text-sm text-gray-300">Executor keeps equity</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-blue-500 mt-1" />
                            <span className="text-sm text-gray-300">Lower risk, protected by assets</span>
                        </li>
                    </ul>
                    <div className="text-xs text-gray-500 bg-black/40 p-3 rounded border border-white/5">
                        <strong>Example:</strong> Providing equipment financing for a Co-op, repaid via 5% of harvest revenue.
                    </div>
                </div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-12 bg-white/5 inline-block mx-auto px-6 py-2 rounded-full border border-white/10">
                <Info size={14} className="inline mr-2" />
                Final terms are defined per proposal and approved by governance vote.
            </p>
        </section>
    )
}
