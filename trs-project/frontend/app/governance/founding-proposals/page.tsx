'use client';

import { ShieldCheck, BookOpen, Scale, Users, FileText, Globe, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function FoundingProposalsPage() {
    const proposals = [
        {
            id: 1,
            title: "Treasury & Capital Management Framework",
            priority: "Highest Priority — Non-Negotiable",
            icon: <Scale className="text-yellow-400" size={32} />,
            purpose: "Define how funds are stored, released, reported, and protected.",
            sections: [
                "Treasury Wallet(s) (Operational, Reserve, Emergency)",
                "Spending Rules & Payout Models",
                "Reporting Cadence & Risk Controls",
                "Approval Standards (Founder-only voting)"
            ],
            color: "border-yellow-500/50 bg-yellow-500/10"
        },
        {
            id: 2,
            title: "DAO Partner & Execution Entity Framework",
            priority: "Who is allowed to work with DAO money",
            icon: <Users className="text-blue-400" size={32} />,
            purpose: "Create a standardized onboarding & approval system for execution partners.",
            sections: [
                "Eligibility Criteria & Tier Requirements",
                "Approval Threshold (≥80% Founder approval)",
                "Rights Granted & Removal Rules",
                "Transparency & Public execution wallets"
            ],
            color: "border-blue-500/50 bg-blue-500/10"
        },
        {
            id: 3,
            title: "Governance & Proposal Lifecycle Rules",
            priority: "How decisions are made, enforced, and closed",
            icon: <FileText className="text-purple-400" size={32} />,
            purpose: "Standardize how proposals move from idea → execution → reporting.",
            sections: [
                "Proposal Types (Governance, Partner, Budget, Project)",
                "Lifecycle (Draft → Vote → Execute → Report → Archive)",
                "Voting Power Rules & Quorum",
                "Cooldowns & Re-submission Rules"
            ],
            color: "border-purple-500/50 bg-purple-500/10"
        },
        {
            id: 4,
            title: "Skills, Jobs & Contribution Economy",
            priority: "How members create value and earn",
            icon: <BookOpen className="text-green-400" size={32} />,
            purpose: "Turn member skills into institutional execution capacity.",
            sections: [
                "Skill Registry & Wallet-linked profiles",
                "Job Creation Rules & Priority Logic",
                "Compensation Models (Fixed, Milestone, Performance)",
                "Reputation Effects"
            ],
            color: "border-green-500/50 bg-green-500/10"
        },
        {
            id: 5,
            title: "Legal, Compliance & Off-Chain Interface",
            priority: "Bridge between DAO and real world",
            icon: <ShieldCheck className="text-red-400" size={32} />,
            purpose: "Define how the DAO interfaces with LLCs, banks, and contracts.",
            sections: [
                "Legal Wrapper Strategy (Jurisdiction options)",
                "Authorized Signers (Governance-controlled)",
                "Compliance Philosophy & Risk Disclosure",
                "Executor-level responsibility"
            ],
            color: "border-red-500/50 bg-red-500/10"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            {/* Header */}
            <header className="mb-16 text-center">
                <Link href="/governance" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowRight className="rotate-180" size={16} /> Back to Governance Hub
                </Link>
                <h1 className="text-5xl font-bold text-white mb-6 font-serif">Founding Proposals</h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    Required DAO Foundations. Before Thrive Realm invests in any physical project, the DAO must first establish itself as a legally, financially, and operationally solid for-profit institution.
                </p>
            </header>

            {/* Critical Message */}
            <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-8 rounded-2xl mb-16 text-center backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-3">🧠 Message to Future Founders</h3>
                <p className="text-gray-300 text-lg">
                    "Proposals aligned with these templates are significantly more likely to be approved.
                    Incomplete, unclear, or premature project proposals may be rejected regardless of enthusiasm."
                </p>
            </div>

            {/* The 5 Pillars */}
            <div className="space-y-8 mb-20">
                <h2 className="text-3xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">The First 5 Essential Proposals</h2>
                <div className="grid gap-8">
                    {proposals.map((p) => (
                        <div key={p.id} className={`glass-card p-8 border ${p.color} relative overflow-hidden group hover:scale-[1.01] transition-all duration-300`}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {p.icon}
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="p-4 bg-black/40 rounded-xl border border-white/5 shrink-0">
                                    {p.icon}
                                    <div className="text-center mt-2 font-bold text-white/50">#{p.id}</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-white">{p.title}</h3>
                                        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-gray-300">
                                            {p.priority}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 mb-6 text-lg">{p.purpose}</p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {p.sections.map((s, i) => (
                                            <div key={i} className="flex items-center gap-3 text-gray-400">
                                                <CheckCircle size={16} className="text-purple-500/50" />
                                                <span>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center shrink-0">
                                    <Link href="/proposals/new" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white font-bold transition flex items-center gap-2 whitespace-nowrap">
                                        Draft This <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Proposal #6 */}
            <div className="border-t border-white/10 pt-16">
                <div className="glass-card bg-gradient-to-br from-gray-900 to-black p-8 border border-white/10 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-white/5 rounded-xl text-gray-500 shrink-0">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">🧩 Proposal #6 — First Physical Project</h3>
                            <p className="text-yellow-500 font-bold mb-4 uppercase text-sm tracking-wide">Only After #1–5 Are Approved</p>
                            <p className="text-gray-400 mb-6">
                                The DAO is ready to fund real estate, infrastructure, agriculture, manufacturing, or energy projects only after the foundational governance is set.
                                This proposal should reference the previous five explicitly.
                            </p>
                            <div className="flex gap-2">
                                {['Real Estate', 'Infrastructure', 'Agriculture', 'Energy'].map(t => (
                                    <span key={t} className="px-3 py-1 bg-white/5 rounded text-xs text-gray-500">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
