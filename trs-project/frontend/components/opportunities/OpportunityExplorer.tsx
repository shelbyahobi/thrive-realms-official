'use client';

import { useState } from 'react';
import { Sprout, FlaskConical, Factory, ArrowRight, Info, ShieldCheck, Coins, Users } from 'lucide-react';

type Sector = 'Agriculture' | 'Research' | 'SME' | 'Infrastructure';
type FinanceType = 'Equity' | 'Loan' | 'Grant' | 'Hybrid';

interface Archetype {
    id: string;
    title: string;
    sector: Sector;
    financeType: FinanceType[];
    executorType: string;
    description: string;
    impact: string[];
    risk: string;
    icon: any;
    color: string;
}

const ARCHETYPES: Archetype[] = [
    {
        id: 'regen-ag',
        title: 'Regenerative Agriculture',
        sector: 'Agriculture',
        financeType: ['Loan', 'Hybrid'],
        executorType: 'Co-ops & Family Farms',
        description: 'Transition funding for soil regeneration. Capital is used for seeds, equipment, and biological inputs during the yield-dip period.',
        impact: ['Soil Carbon Sequestration', 'Biodiversity Restoration', 'Water Retention'],
        risk: 'Moderate (Weather/Yield Volatility)',
        icon: <Sprout size={32} />,
        color: 'emerald'
    },
    {
        id: 'deep-tech',
        title: 'Applied Research Pilot',
        sector: 'Research',
        financeType: ['Grant', 'Equity'],
        executorType: 'Universities & Labs',
        description: 'Bridging the "Valley of Death" for lab-scale innovations. Funding supports pilot facility construction and real-world testing.',
        impact: ['Technology Transfer', 'Industrial Decarbonization', 'IP Creation'],
        risk: 'High (Technology Viability)',
        icon: <FlaskConical size={32} />,
        color: 'purple'
    },
    {
        id: 'local-mfg',
        title: 'Community Manufacturing',
        sector: 'SME',
        financeType: ['Equity', 'Loan'],
        executorType: 'Local SMEs',
        description: 'Import-substitution manufacturing. Capital finances machinery and working capital to produce essential goods locally.',
        impact: ['Local Employment', 'Supply Chain Resilience', 'Regional GDP'],
        risk: 'Moderate (Market Demand)',
        icon: <Factory size={32} />,
        color: 'blue'
    }
];

export default function OpportunityExplorer() {
    const [activeFilter, setActiveFilter] = useState<Sector | 'All'>('All');
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

    const filtered = activeFilter === 'All' ? ARCHETYPES : ARCHETYPES.filter(a => a.sector === activeFilter);

    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-serif text-white mb-4">Explore Opportunity Frameworks</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Thrive Realms does not fund random ideas. We operate through established <strong>Impact Archetypes</strong>—proven models for deploying capital effectively.
                </p>
            </div>

            {/* Filters */}
            <div className="flex justify-center gap-2 mb-12 flex-wrap">
                {['All', 'Agriculture', 'Research', 'SME'].map(f => (
                    <button
                        key={f}
                        onClick={() => setActiveFilter(f as any)}
                        className={`px-6 py-2 rounded-full border transition font-bold ${activeFilter === f
                            ? 'bg-white text-black border-white'
                            : 'bg-black/50 border-white/10 text-gray-400 hover:border-white/30'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filtered.map(item => (
                    <div key={item.id} className="group relative">
                        <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition duration-500`} />
                        <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition flex flex-col">
                            <div className={`w-16 h-16 rounded-xl bg-${item.color}-900/30 border border-${item.color}-500/30 flex items-center justify-center mb-6 text-${item.color}-400 group-hover:scale-110 transition`}>
                                {item.icon}
                            </div>

                            <div className="mb-6">
                                <span className={`text-xs font-bold uppercase tracking-widest text-${item.color}-400 mb-2 block`}>
                                    {item.sector}
                                </span>
                                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    {item.description}
                                </p>
                            </div>

                            <div className="space-y-4 mt-auto">
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Coins size={16} className="text-gray-500" />
                                    <span>
                                        Model: <strong className="text-white">{item.financeType.join(' / ')}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <Users size={16} className="text-gray-500" />
                                    <span>
                                        Executor: <strong className="text-white">{item.executorType}</strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-300">
                                    <ShieldCheck size={16} className="text-gray-500" />
                                    <span>
                                        Risk: <strong className="text-white">{item.risk}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Impact Targets</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.impact.map(i => (
                                        <span key={i} className="px-2 py-1 rounded bg-black/50 border border-white/10 text-xs text-gray-300">
                                            {i}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
