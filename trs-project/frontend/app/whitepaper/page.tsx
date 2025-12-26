'use client';
import { FileText, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function WhitepaperPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                <ArrowLeft size={16} /> Back to Home
            </Link>

            <div className="glass-card p-12 bg-black/40 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-64 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="text-purple-500" size={32} /> Whitepaper
                </h1>

                <div className="prose prose-invert max-w-none space-y-12">

                    {/* 1. About */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. About Thrive Realm</h2>
                        <p className="text-gray-300">
                            Thrive Realm is a decentralized, autonomous, for-profit community designed to fund, build, and scale real-world and digital projects through transparent on-chain governance.
                        </p>
                        <ul className="list-disc pl-5 mt-4 text-gray-400 space-y-2">
                            <li>Permissionless participation (wallet-based, no mandatory KYC at protocol level)</li>
                            <li>Token-weighted governance</li>
                            <li>Transparent treasury management</li>
                            <li>Fair access to jobs, execution roles, and rewards</li>
                            <li>Long-term ecosystem value creation</li>
                        </ul>
                    </section>

                    {/* 2. Vision & Mission */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Vision & Mission</h2>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5 mb-6">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Vision</h3>
                            <p className="text-gray-300">
                                To create a borderless, self-sustaining ecosystem where individuals and companies collaboratively fund and execute impactful projects with full transparency and fair incentives.
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xl font-bold text-blue-400 mb-2">Mission</h3>
                            <ul className="list-disc pl-5 text-gray-300 space-y-2">
                                <li>Enable decentralized investment without gatekeepers</li>
                                <li>Align incentives between investors, builders, and operators</li>
                                <li>Fund real economic activity, not speculation</li>
                                <li>Build trust through open governance and on-chain accountability</li>
                            </ul>
                        </div>
                    </section>

                    {/* 3. Core Principles */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Core Principles</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-white font-bold mb-1">Transparency First</h4>
                                <p className="text-sm text-gray-400">All proposals, votes, budgets, and payouts are visible on-chain.</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-white font-bold mb-1">Merit & Commitment</h4>
                                <p className="text-sm text-gray-400">Power is determined by contribution and stake, not nationality or status.</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-white font-bold mb-1">Permissionless Governance</h4>
                                <p className="text-sm text-gray-400">No protocol-level KYC is required to participate in governance.</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                <h4 className="text-white font-bold mb-1">Real Value Creation</h4>
                                <p className="text-sm text-gray-400">Funds are deployed into real projects, services, and infrastructure.</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. Token Economics */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Token Economics (TRS)</h2>
                        <p className="text-gray-300 mb-6">
                            TRS is the governance and utility token of the Thrive Realm ecosystem, designed with strict supply controls to prevent centralization.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-white/5 p-4 rounded border border-white/10">
                                <h3 className="text-sm text-gray-400 uppercase font-bold mb-1">Max Supply</h3>
                                <p className="text-xl font-mono text-white">1,000,000,000 TRS</p>
                                <p className="text-xs text-gray-500 mt-1">Fixed Hard Cap. No minting function.</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded border border-white/10">
                                <h3 className="text-sm text-gray-400 uppercase font-bold mb-1">Anti-Whale Cap</h3>
                                <p className="text-xl font-mono text-white">1% of Supply</p>
                                <p className="text-xs text-gray-500 mt-1">Maximum per wallet (excluding Treasury & Contracts).</p>
                            </div>
                        </div>

                        <div className="bg-purple-900/20 p-4 rounded border border-purple-500/20 mb-6">
                            <h3 className="text-sm text-purple-400 uppercase font-bold mb-2">Treasury Exemption</h3>
                            <p className="text-sm text-gray-300">
                                The DAO Treasury is exempt from wallet limits to securely hold unallocated supply. Treasury funds can ONLY be moved via successful governance vote.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {["Governance voting", "Proposal submission", "Job eligibility", "Dividend rewards", "Ecosystem access"].map((util, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                                    {util}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* 5. Tier System */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6">5. Tier System</h2>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-900/40 to-black p-6 rounded-xl border border-purple-500/30">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white">Founder Tier</h3>
                                    <span className="text-purple-400 font-mono font-bold">24,000+ TRS</span>
                                </div>
                                <ul className="mt-4 space-y-1 text-gray-300 text-sm">
                                    <li>• Submit proposals</li>
                                    <li>• Vote on proposals</li>
                                    <li>• Post and apply for jobs</li>
                                    <li>• Claim approved project budgets</li>
                                    <li>• Receive dividends</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-r from-blue-900/40 to-black p-6 rounded-xl border border-blue-500/30">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white">Voter Tier</h3>
                                    <span className="text-blue-400 font-mono font-bold">12,000+ TRS</span>
                                </div>
                                <ul className="mt-4 space-y-1 text-gray-300 text-sm">
                                    <li>• Vote on proposals</li>
                                    <li>• Apply for jobs</li>
                                    <li>• Receive dividends</li>
                                </ul>
                            </div>

                            <div className="bg-gradient-to-r from-gray-800/40 to-black p-6 rounded-xl border border-gray-500/30">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-bold text-white">Member Tier</h3>
                                    <span className="text-gray-400 font-mono font-bold">1,200+ TRS</span>
                                </div>
                                <ul className="mt-4 space-y-1 text-gray-300 text-sm">
                                    <li>• Access job board</li>
                                    <li>• Apply for approved jobs</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 7. Coordination Channels */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Secure Coordination Channels</h2>
                        <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-lg">
                                    <Shield className="text-indigo-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">Integrated Ops Center</h3>
                                    <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                                        Thrive Realm features an <strong>on-platform, token-gated secure chat</strong>.
                                        Founders and Voters have access to encrypted channels ("Proposal Diligence", "Treasury Audit") directly within the dashboard.
                                    </p>
                                    <p className="text-xs text-gray-500 italic">
                                        No external tools required. Access is automatically granted based on your on-chain Tier.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 6. Governance System */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Governance System</h2>
                        <div className="space-y-8">
                            {/* Proposal Lifecycle */}
                            <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                                <h3 className="text-xl font-bold text-white mb-4">Proposal Lifecycle</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                        <div>
                                            <h4 className="text-white font-bold">Submission</h4>
                                            <p className="text-sm text-gray-400">Founders submit proposals. Must include: Budget breakdown, Execution milestones, and detailed operational plan.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                        <div>
                                            <h4 className="text-white font-bold">Active Vote</h4>
                                            <p className="text-sm text-gray-400">7-day voting window. Token-weighted voting. Quorum required for validity.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                        <div>
                                            <h4 className="text-white font-bold">Timelock & Execution</h4>
                                            <p className="text-sm text-gray-400">Successful proposals enter a 2-day timelock before execution to prevent flash-loan attacks.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                                        <div>
                                            <h4 className="text-white font-bold">Reporting & Review</h4>
                                            <p className="text-sm text-gray-400">Executors must report progress on-chain. Failure to report pauses future funding.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7-10. Systems Overview */}
                    <section className="space-y-8">
                        {/* Execution Entities */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-3">Execution Partner Framework</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                To ensure quality and accountability, large-scale mandates are restricted to Verified Execution Partners.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Verification Process</h4>
                                    <p className="text-xs text-gray-500">Entities must submit a "Company Approval" proposal. The DAO votes to whitelist their wallet address based on reputation and credentials.</p>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Revocation</h4>
                                    <p className="text-xs text-gray-500">The DAO can vote to revoke "Verified" status at any time if an entity fails to deliver or acts maliciously.</p>
                                </div>
                            </div>
                        </div>

                        {/* Treasury Risk */}
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-3">Treasury Risk Controls</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Our treasury is protected by strict smart contract rules, not just goodwill.
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <li className="bg-black/20 p-3 rounded text-sm text-gray-300 border border-white/5">
                                    <strong className="block text-white mb-1">Milestone Releases</strong>
                                    Funds are escrowed and released only upon completion of defined milestones.
                                </li>
                                <li className="bg-black/20 p-3 rounded text-sm text-gray-300 border border-white/5">
                                    <strong className="block text-white mb-1">Emergency Pause</strong>
                                    A "Guardian" role can pause protocol execution in response to security threats.
                                </li>
                                <li className="bg-black/20 p-3 rounded text-sm text-gray-300 border border-white/5">
                                    <strong className="block text-white mb-1">No Unilateral Access</strong>
                                    Founders cannot withdraw funds without a successful DAO vote.
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 11. Roadmap */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">11. Roadmap</h2>
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded flex gap-4 items-center">
                                <span className="text-green-400 font-bold">Phase 1</span>
                                <span className="text-gray-300">Foundation (Contracts, Governance MVP, Tiers) - <span className="text-xs border border-green-500/50 px-2 py-0.5 rounded text-green-400">COMPLETED</span></span>
                            </div>
                            <div className="bg-white/5 p-4 rounded flex gap-4 items-center opacity-70">
                                <span className="text-blue-400 font-bold">Phase 2</span>
                                <span className="text-gray-300">Public Testnet (Open Testing, Security Hardening)</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded flex gap-4 items-center opacity-50">
                                <span className="text-purple-400 font-bold">Phase 3</span>
                                <span className="text-gray-300">Mainnet Launch (First Proposals, Job Execution Live)</span>
                            </div>
                        </div>
                    </section>

                    {/* 12. Legal */}
                    <section className="border-t border-white/10 pt-8 mt-12 mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">12. Legal Disclaimer & Risk Disclosure</h2>
                        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-lg text-xs text-gray-400 space-y-3">
                            <p>
                                <strong className="text-red-400 block mb-1">No Investment Advice or Guarantee</strong>
                                Thrive Realm is a decentralized protocol running on a public blockchain. "TRS" tokens are governance instruments, not equity or securities. Holding TRS does not guarantee dividends, profits, or voting outcomes. All participation is at your own risk.
                            </p>
                            <p>
                                <strong className="text-red-400 block mb-1">Protocol "As-Is"</strong>
                                The protocol software is provided "as-is" without warranty of any kind. The core team and contributors are not liable for smart contract exploits, wallet hacks, or fund losses arising from user interaction with the protocol.
                            </p>
                            <p>
                                <strong className="text-red-400 block mb-1">Jurisdiction & Compliance</strong>
                                Users are solely responsible for ensuring their participation complies with the laws of their jurisdiction. Thrive Realm creates no formal legal partnership or employment relationship between token holders.
                            </p>
                            <p>
                                <strong className="text-red-400 block mb-1">For-Profit DAO Structure</strong>
                                While Thrive Realm aims to generate revenue, it operates as a cooperative digital entity. Dividend distributions are automated by code and dependent on successful execution of community mandates, not the efforts of a central management team.
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
