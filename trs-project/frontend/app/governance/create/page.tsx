'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, DollarSign, Scale, ChevronRight } from 'lucide-react';
import WalletGuard from '../../components/layout/WalletGuard';

export default function CreateGovernancePage() {
    return (
        <WalletGuard>
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif text-white mb-4">Governance Hub</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Shape the future of Thrive Realms. Select a pillar to initiate a proposal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pillar 1: Execution Network */}
                    <Link href="/proposals/new?pillar=EXECUTION" className="group relative glass-card p-1 border-white/10 hover:border-blue-500/50 transition duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="p-8 relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-blue-900/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition duration-300">
                                <Briefcase size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Execution Network</h2>
                            <p className="text-gray-400 mb-8 flex-grow">
                                Apply to become a verified Execution Partner, update your entity profile, or form an Execution Pod.
                            </p>
                            <div className="flex items-center text-blue-400 font-bold group-hover:gap-2 transition-all">
                                Initialize Flow <ChevronRight size={18} />
                            </div>
                        </div>
                    </Link>

                    {/* Pillar 2: Capital Allocation */}
                    <Link href="/proposals/new?pillar=CAPITAL" className="group relative glass-card p-1 border-white/10 hover:border-green-500/50 transition duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="p-8 relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-green-900/30 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition duration-300">
                                <DollarSign size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Capital Allocation</h2>
                            <p className="text-gray-400 mb-8 flex-grow">
                                Request funding for Projects, Research, SME Growth, or Infrastructure initiatives.
                            </p>
                            <div className="flex items-center text-green-400 font-bold group-hover:gap-2 transition-all">
                                Initialize Flow <ChevronRight size={18} />
                            </div>
                        </div>
                    </Link>

                    {/* Pillar 3: Protocol Law */}
                    <Link href="/proposals/new?pillar=LAW" className="group relative glass-card p-1 border-white/10 hover:border-yellow-500/50 transition duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                        <div className="p-8 relative z-10 h-full flex flex-col">
                            <div className="w-14 h-14 rounded-2xl bg-yellow-900/30 flex items-center justify-center text-yellow-400 mb-6 group-hover:scale-110 transition duration-300">
                                <Scale size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Protocol Law</h2>
                            <p className="text-gray-400 mb-8 flex-grow">
                                Propose changes to DAO Policy, Legal Structures, Governance Parameters, or Risk Frameworks.
                            </p>
                            <div className="flex items-center text-yellow-400 font-bold group-hover:gap-2 transition-all">
                                Initialize Flow <ChevronRight size={18} />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </WalletGuard>
    );
}
