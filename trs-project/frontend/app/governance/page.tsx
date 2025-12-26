'use client';
import { useState } from 'react';
import { Vote, Briefcase, Landmark, Info } from 'lucide-react';
import ProposalsList from '../../components/governance/ProposalsList';
import ProjectsList from '../../components/governance/ProjectsList';
import TreasuryView from '../../components/governance/TreasuryView';

export default function GovernancePage() {
    const [activeTab, setActiveTab] = useState<'proposals' | 'projects' | 'treasury'>('proposals');

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4 font-serif">Governance Hub</h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-6">
                    The command center for the Thrive Realms DAO. Vote on mandates, track funded projects, and audit the treasury.
                </p>
                <Link href="/governance/founding-proposals" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all border border-purple-500/20 text-sm font-bold">
                    <Info size={16} /> View Founding Governance Playbook
                </Link>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/5 p-1 rounded-xl flex gap-2 border border-white/10">
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'proposals' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Vote size={18} /> Vote (Proposals)
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Briefcase size={18} /> Track (Executed)
                    </button>
                    <button
                        onClick={() => setActiveTab('treasury')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'treasury' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Landmark size={18} /> Audit (Treasury)
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'proposals' && <ProposalsList />}
                {activeTab === 'projects' && <ProjectsList />}
                {activeTab === 'treasury' && <TreasuryView />}
            </div>
        </div>
    );
}
