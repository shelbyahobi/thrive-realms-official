'use client';

import Link from 'next/link';
import { ArrowRight, Globe, Shield } from 'lucide-react';
import OpportunityExplorer from '../../components/opportunities/OpportunityExplorer';
import CapitalModels from '../../components/opportunities/CapitalModels';
import RolesWanted from '../../components/opportunities/RolesWanted';

export default function OpportunitiesPage() {
    return (
        <div className="container mx-auto px-4 py-12">

            {/* HERO SECTION */}
            <header className="text-center py-20 px-4 mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/30 text-blue-400 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4">
                    <Globe size={16} /> Global Execution Network
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 font-serif leading-tight">
                    A Marketplace for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                        Real-World Execution
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                    Opportunities are proposed, vetted, funded, and executed through on-chain governance.
                    <br className="hidden md:block" />
                    We build the framework; you build the future.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link href="/proposals/new?type=entity"
                        className="px-8 py-4 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2">
                        Register as Partner <ArrowRight size={20} />
                    </Link>
                    <Link href="/governance"
                        className="px-8 py-4 bg-white/5 text-white border border-white/20 font-bold text-lg rounded-full hover:bg-white/10 transition">
                        View Governance
                    </Link>
                </div>
            </header>

            {/* 1. FRAMEWORK EXPLORER */}
            <OpportunityExplorer />

            {/* 2. CAPITAL MODELS */}
            <CapitalModels />

            {/* 3. ROLES WANTED */}
            <RolesWanted />

            {/* 4. FINAL CTA */}
            <section className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-12 text-center my-20">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Propose a Framework?</h2>
                <p className="text-gray-400 max-w-xl mx-auto mb-8">
                    If you fit one of these archetypes, or have a unique model for deploying capital, register your entity to begin the vetting process.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/proposals/new?type=entity" className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center gap-2">
                        <Shield size={18} /> Begin Verification
                    </Link>
                </div>
            </section>

        </div>
    );
}
