'use client';

import { Shield, Globe, Scale, BookOpen, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function InvestmentMandatePage() {
    return (
        <div className="container mx-auto px-4 py-12">

            {/* Hero Section */}
            <div className="mb-16 text-center max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/20">
                        <Scale className="text-emerald-400" size={24} />
                    </div>
                    <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Governance Protocol 0x1</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-6">The Investment Mandate</h1>
                <p className="text-xl text-gray-300 leading-relaxed font-light">
                    "Thrive Realm prioritizes real economic activity in regions where access to capital is limited,
                    enabling local representatives to build sustainable businesses with global transparency."
                </p>
            </div>

            {/* Core Philosophy Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20 p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <Globe className="text-emerald-400" />
                        Phase 1: Priority Regions
                    </h3>
                    <p className="text-gray-400 mb-6">
                        We deploy capital where the marginal utility is highest. Our initial focus is strictly limited to
                        emerging markets where small injections of capital create exponential social impact.
                    </p>
                    <div className="space-y-3">
                        <RegionItem region="Sub-Saharan Africa" status="Active" color="emerald" />
                        <RegionItem region="South Asia" status="Active" color="emerald" />
                        <RegionItem region="Latin America" status="Active" color="emerald" />
                        <RegionItem region="MENA Region" status="Active" color="emerald" />
                        <RegionItem region="Western Europe / North America" status="Deprioritized" color="red" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <BookOpen className="text-blue-400" />
                        The 5-Point Success Formula
                    </h3>
                    <p className="text-gray-400 mb-6">
                        Every proposal must strictly adhere to this format to be considered for funding.
                    </p>
                    <ul className="space-y-4">
                        <SuccessPoint num="1" title="The Impact (What)" desc="2-sentence summary of the business and why it matters." />
                        <SuccessPoint num="2" title="The Need (Ask)" desc="Clear budget requirements (e.g. $5k for machinery)." />
                        <SuccessPoint num="3" title="The Return (Why)" desc="What the DAO gets back (Revenue share, interest, or influence)." />
                        <SuccessPoint num="4" title="The Milestones (When)" desc="3 simple checkpoints for fund release." />
                        <SuccessPoint num="5" title="The Proof (Who)" desc="Local business registration or trusted ID verification." />
                    </ul>
                </div>
            </div>

            {/* Priority Scoring Matrix */}
            <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-6 pl-4 border-l-4 border-amber-500">
                    Priority Scoring Matrix
                </h3>
                <div className="glass-card overflow-hidden border border-white/10 rounded-xl">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-white uppercase font-bold">
                            <tr>
                                <th className="p-4">Criteria</th>
                                <th className="p-4">Weighting</th>
                                <th className="p-4">Rationale</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <ScoringRow
                                criteria="Low-Income Country Origin"
                                weight="HIGH (+10)"
                                intent="success"
                                rationale="Directly targets capital scarcity gap."
                            />
                            <ScoringRow
                                criteria="Local Ownership > 50%"
                                weight="HIGH (+8)"
                                intent="success"
                                rationale="Ensures long-term community wealth retention."
                            />
                            <ScoringRow
                                criteria="Essential Services (Food/Water/Energy)"
                                weight="HIGH (+8)"
                                intent="success"
                                rationale="Foundational infrastructure for resilience."
                            />
                            <ScoringRow
                                criteria="Community Representative Onboarded"
                                weight="REQUIRED"
                                intent="warning"
                                rationale="Must have a human accountability anchor."
                            />
                            <ScoringRow
                                criteria="First-World Based Project"
                                weight="NEGATIVE (-15)"
                                intent="danger"
                                rationale="Capital is abundant in these regions; rarely aligns with mission."
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Disclaimer / Exclusion Policy */}
            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-xl flex gap-4 items-start">
                <AlertTriangle className="text-red-400 shrink-0" size={24} />
                <div>
                    <h4 className="text-red-400 font-bold mb-2">Exclusion Policy Statement</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Thrive Realm reserves the right to reject any proposal that does not explicitly serve vulnerable populations,
                        even if it is financially viable. Projects based in high-income economies are generally disqualified unless
                        a direct, verifiable link to underserved beneficiary communities is proven (e.g., an NGO funnel or diaspora remittance tool).
                    </p>
                </div>
            </div>

        </div>
    );
}

function RegionItem({ region, status, color }: { region: string, status: string, color: 'emerald' | 'red' }) {
    const colorClass = color === 'emerald' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
    return (
        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-gray-300 font-bold flex items-center gap-2">
                <MapPin size={14} className="text-gray-500" /> {region}
            </span>
            <span className={`text-xs px-2 py-1 rounded border ${colorClass} uppercase font-bold tracking-wider`}>
                {status}
            </span>
        </div>
    )
}

function SuccessPoint({ num, title, desc }: { num: string, title: string, desc: string }) {
    return (
        <li className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/30 shrink-0 mt-0.5">
                {num}
            </div>
            <div>
                <strong className="text-white block text-sm">{title}</strong>
                <span className="text-gray-500 text-xs">{desc}</span>
            </div>
        </li>
    )
}

function ScoringRow({ criteria, weight, rationale, intent }: { criteria: string, weight: string, rationale: string, intent: 'success' | 'warning' | 'danger' }) {
    let weightColor = 'text-gray-400';
    if (intent === 'success') weightColor = 'text-emerald-400 font-bold';
    if (intent === 'warning') weightColor = 'text-amber-400 font-bold';
    if (intent === 'danger') weightColor = 'text-red-400 font-bold';

    return (
        <tr className="hover:bg-white/5 transition">
            <td className="p-4 font-medium text-white">{criteria}</td>
            <td className={`p-4 ${weightColor}`}>{weight}</td>
            <td className="p-4 text-xs italic">{rationale}</td>
        </tr>
    )
}
