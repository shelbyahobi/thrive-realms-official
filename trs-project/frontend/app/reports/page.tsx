import React from 'react';
import Link from 'next/link';

export default function ReportsPage() {
    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-12 flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                Project Reporting
            </h1>
            <p className="text-gray-400 mb-8">
                Submit milestone reports to unlock escrowed funds.
            </p>
            <div className="p-8 border border-white/10 rounded-xl bg-white/5">
                <p className="text-sm text-gray-500 mb-4">Select an active project to report on:</p>
                <select className="w-full bg-black border border-white/20 rounded p-2 text-white mb-4">
                    <option>Genesis Agri-Tech (Seed)</option>
                </select>
                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors">
                    Start Report
                </button>
            </div>
            <Link href="/transparency" className="mt-8 text-gray-500 hover:text-white underline">
                Back to Dashboard
            </Link>
        </main>
    );
}
