'use client';

import { BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FoundingPlaybookWidget() {
    return (
        <div className="glass-card p-6 border-l-4 border-yellow-500 flex flex-col justify-between h-full bg-yellow-500/5">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-yellow-500 uppercase font-bold">Strategic Action</p>
                    <BookOpen size={16} className="text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Founding Playbook</h3>
                <p className="text-xs text-gray-400">
                    Required governance framework to establish the DAO institution.
                </p>
            </div>

            <Link
                href="/governance/founding-proposals"
                className="mt-4 w-full py-2 rounded text-sm font-bold transition flex items-center justify-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
            >
                View Playbook <ArrowRight size={14} />
            </Link>
        </div>
    );
}
