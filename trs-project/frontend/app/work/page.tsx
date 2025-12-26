'use client';
import { useState } from 'react';
import { Briefcase, Building2 } from 'lucide-react';
import OpportunitiesList from '../../components/work/OpportunitiesList';
import CompanyList from '../../components/work/CompanyList';

export default function WorkPage() {
    const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');

    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold text-white mb-4 font-serif">Work Hub</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Find work, register your execution entity, and contribute to the ecosystem.
                </p>
            </header>

            {/* Tabs */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/5 p-1 rounded-xl flex gap-2 border border-white/10">
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'jobs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Briefcase size={18} /> Opportunities
                    </button>
                    <button
                        onClick={() => setActiveTab('companies')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'companies' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Building2 size={18} /> Execution Partners
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'jobs' && <OpportunitiesList />}
                {activeTab === 'companies' && <CompanyList />}
            </div>
        </div>
    );
}
