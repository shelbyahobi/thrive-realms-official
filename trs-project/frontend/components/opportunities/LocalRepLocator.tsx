'use client';

import { useState } from 'react';
import { MapPin, UserCheck, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

type RegionStatus = 'active' | 'open' | 'closed';

const REGIONS = [
    { id: 'ng', name: 'Nigeria', status: 'active', rep: 'Tunde Adebayo', contact: '@tunde_dao' },
    { id: 'ke', name: 'Kenya', status: 'active', rep: 'Sarah Wanjiku', contact: '@sarah_k' },
    { id: 'vn', name: 'Vietnam', status: 'active', rep: 'Nguyen Van Minh', contact: '@minh_builds' },
    { id: 'gh', name: 'Ghana', status: 'open', rep: null, contact: null },
    { id: 'br', name: 'Brazil', status: 'open', rep: null, contact: null },
    { id: 'in', name: 'India', status: 'open', rep: null, contact: null },
];

export default function LocalRepLocator() {
    const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[0] | null>(null);

    return (
        <div className="glass-card p-6 border border-white/10 bg-black/40">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin className="text-purple-400" />
                        Find a Local Representative
                    </h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-lg">
                        <strong>What is a Local Rep?</strong> Verified trusted community members who visit your business physically to validate its existence and needs. They are your bridge to the DAO Treasury.
                    </p>
                </div>
                <div className="hidden md:block bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                    <div className="text-xs text-purple-300 font-bold uppercase mb-1">Coverage</div>
                    <div className="text-2xl font-mono text-white">3 Regions Active</div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Map / List Column */}
                <div className="space-y-4">
                    <div className="flex gap-2 text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="text-emerald-400">● Active Hubs</span>
                        <span className="text-amber-400 ml-4">● Open for Applications</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {REGIONS.map((region) => (
                            <button
                                key={region.id}
                                onClick={() => setSelectedRegion(region)}
                                className={`p-3 rounded-lg border text-left transition-all ${selectedRegion?.id === region.id
                                    ? 'bg-white/10 border-white text-white'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">{region.name}</span>
                                    {region.status === 'active' ? (
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                    ) : (
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    )}
                                </div>
                                <div className="text-[10px] uppercase mt-1 opacity-70">
                                    {region.status === 'active' ? 'Verified Rep Available' : 'Rep Needed'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details Column */}
                <div className="bg-white/5 rounded-xl p-6 flex flex-col justify-center border border-white/5 min-h-[250px]">
                    {selectedRegion ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            {selectedRegion.status === 'active' ? (
                                <>
                                    <div className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        Active Hub
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-1">{selectedRegion.name}</h4>
                                    <p className="text-gray-400 text-sm mb-6">Verified Zone</p>

                                    <div className="bg-black/40 p-4 rounded-lg border border-emerald-500/20 mb-6">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Regional Ambassador</div>
                                        <div className="text-lg font-bold text-white flex items-center gap-2">
                                            <UserCheck size={18} className="text-emerald-400" />
                                            {selectedRegion.rep}
                                        </div>
                                        <div className="mt-2 text-sm text-emerald-400">Verified since 2024</div>
                                    </div>

                                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition">
                                        Contact {selectedRegion.rep?.split(' ')[0]}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                        Open Region
                                    </div>
                                    <h4 className="text-2xl font-bold text-white mb-1">{selectedRegion.name}</h4>
                                    <p className="text-gray-400 text-sm mb-6">No Verified Rep Yet</p>

                                    <div className="bg-amber-900/10 p-4 rounded-lg border border-amber-500/20 mb-6">
                                        <p className="text-sm text-amber-200">
                                            We are looking for trusted community leaders in <strong>{selectedRegion.name}</strong> to perform due diligence for the DAO.
                                        </p>
                                        <ul className="mt-3 space-y-2 text-xs text-gray-400">
                                            <li>• Earn reputation & rewards</li>
                                            <li>• Vote on local deals</li>
                                            <li>• Gatekeep quality projects</li>
                                        </ul>
                                    </div>

                                    <button className="w-full bg-amber-600 hover:bg-amber-700 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                                        Apply to be a Rep <ArrowRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <Globe className="mx-auto mb-3 opacity-20" size={48} />
                            <p>Select a region to see representative details or application status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
