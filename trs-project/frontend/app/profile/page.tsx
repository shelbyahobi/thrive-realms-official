'use client';
import { User, Shield, Briefcase, Award } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                <User size={16} /> Dashboard
            </Link>

            <div className="glass-card p-8 mb-8 flex items-start gap-6">
                <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-500/50">
                    <User size={40} className="text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Member Profile</h1>
                    <div className="flex gap-4 mb-4">
                        <span className="badge bg-blue-500/20 text-blue-300 border-blue-500/30">Voter Tier</span>
                        <span className="badge bg-green-500/20 text-green-300 border-green-500/30">Verified Human</span>
                    </div>
                    <p className="text-gray-400 max-w-xl">
                        [User Bio / Reputation Score Placeholder]
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-400" /> Work History
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded border border-white/5">
                            <p className="text-sm text-gray-500 mb-1">2024 - Present</p>
                            <p className="font-bold text-white">DAO Contributor</p>
                            <p className="text-xs text-purple-400">Core Governance</p>
                        </div>
                        <p className="text-gray-500 italic text-sm text-center">No other history verifying on-chain.</p>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Award size={20} className="text-yellow-400" /> Skills & Badges
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">Solidity</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">Governance</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10 opacity-50 dashed border-dashed">+ Add Skill</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
