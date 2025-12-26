'use client';

import { useState, useEffect } from 'react';
import { ethers, formatEther } from 'ethers';
import { Wallet, CircleDollarSign, Vote, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../lib/contracts';

export default function Home() {
  const { account, provider } = useWallet();
  const [stats, setStats] = useState({
    founders: 0,
    treasuryBalance: '0',
    proposals: 0,
    holders: 0 // Mock for now
  });

  useEffect(() => {
    if (provider) fetchStats();
  }, [provider]);

  async function fetchStats() {
    if (!provider) return;
    try {
      // Treasury Balance (Timelock holds funds)
      const balance = await provider.getBalance(CONTRACT_ADDRESSES.TIMELOCK);

      // Founder Count (Check Tier? No easy way without indexing. Just mock or check specific list if small)
      // For now, hardcode or use a simple heuristic if possible.
      // Let's just mock "1" if we are testing with 1 founder.

      // Proposals Count
      const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, provider);
      // Getting proposal count is tricky without an event indexer or counter on contract. 
      // We'll leave it as "--" or implement a counter later.

      setStats({
        founders: 1, // Mock
        treasuryBalance: formatEther(balance),
        proposals: 0,
        holders: 124 // Mock
      });
    } catch (e) { console.error(e); }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-32 animate-in pt-16">
        <h1 className="text-5xl md:text-7xl mb-6 font-bold text-white tracking-tight leading-tight font-serif">
          Thrive Realms <br />
          <span className="text-gray-400 italic font-light">Governance Protocol</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
          Decentralized governance infrastructure for transparent <br className="hidden md:block" /> real-world capital allocation.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <Link href="/proposals" className="btn btn-primary px-8 py-4 text-lg">
            Enter Governance
          </Link>
          <Link href="/treasury" className="btn btn-secondary px-8 py-4 text-lg">
            View Treasury
          </Link>
        </div>
      </section>

      {/* Trust Layer (Stats) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32 border-y border-white/10 py-12">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2 font-mono">{parseFloat(stats.treasuryBalance).toFixed(2)} BNB</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Treasury Reserve</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-4xl font-bold text-white mb-2 font-mono">{stats.holders}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Active Voters</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-4xl font-bold text-white mb-2 font-mono">{stats.founders}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Founding Stewards</p>
        </div>
        <div className="text-center border-l border-white/5">
          <p className="text-4xl font-bold text-white mb-2 font-mono">{stats.proposals}</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Mandates Approved</p>
        </div>
      </div>

      {/* Investment Mandate */}
      <section className="mb-32 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4 font-serif">Investment Mandate</h2>
          <div className="h-1 w-20 bg-purple-500 mx-auto"></div>
        </div>

        <div className="prose prose-invert prose-lg mx-auto text-gray-300 leading-relaxed text-center">
          <p className="mb-8">
            Thrive Realms Governance Protocol is designed to allocate capital toward productive, real-world initiatives that generate sustainable economic value and verifiable outcomes.
          </p>
          <p className="mb-12">
            The protocol does not restrict itself to a single industry or geography. Instead, capital allocation is governed by token holders, who collectively determine strategic priorities through on-chain proposals and voting.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Infrastructure</h3>
              <p className="text-sm text-gray-400">Real-asset development and physical systems.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Bio-Systems</h3>
              <p className="text-sm text-gray-400">Sustainable agriculture and ecological regeneration.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Technology</h3>
              <p className="text-sm text-gray-400">Tech-enabled services and digital infrastructure.</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Enterprise</h3>
              <p className="text-sm text-gray-400">Community-owned revenue-generating businesses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proposal Lifecycle Visual */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4 font-serif">Governance Lifecycle</h2>
          <div className="h-1 w-20 bg-gray-500 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From raw idea to verified impact. The protocol enforces a strict, transparent pipeline for all capital allocation.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-purple-900 via-blue-900 to-green-900 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {/* Stage 1: Draft */}
            <div className="glass-card bg-black p-6 border border-white/10 text-center group hover:border-purple-500/50 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-purple-900/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400 font-bold text-xl group-hover:scale-110 transition">1</div>
              <h3 className="text-white font-bold mb-2">Draft & Propose</h3>
              <p className="text-sm text-gray-500">Founders submit detailed investment mandates or project proposals with clear milestones and budget requirements.</p>
            </div>

            {/* Stage 2: Vote */}
            <div className="glass-card bg-black p-6 border border-white/10 text-center group hover:border-blue-500/50 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400 font-bold text-xl group-hover:scale-110 transition">2</div>
              <h3 className="text-white font-bold mb-2">Community Vote</h3>
              <p className="text-sm text-gray-500">Token holders cast weighted votes. Quorum ensures legitimacy. Successful proposals are queued for execution.</p>
            </div>

            {/* Stage 3: Execute */}
            <div className="glass-card bg-black p-6 border border-white/10 text-center group hover:border-cyan-500/50 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400 font-bold text-xl group-hover:scale-110 transition">3</div>
              <h3 className="text-white font-bold mb-2">Execute & Unlock</h3>
              <p className="text-sm text-gray-500">Funds are held in strict escrow. Capital is released only as milestones are met and verified by the protocol.</p>
            </div>

            {/* Stage 4: Report */}
            <div className="glass-card bg-black p-6 border border-white/10 text-center group hover:border-green-500/50 transition duration-300">
              <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4 text-green-400 font-bold text-xl group-hover:scale-110 transition">4</div>
              <h3 className="text-white font-bold mb-2">Report & reward</h3>
              <p className="text-sm text-gray-500">Impact is verified. Dividends are calculated. Successful execution improves Founder reputation scores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4 font-serif">How the Protocol Operates</h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-8 bg-black border border-white/10 rounded-lg h-full">
              <div className="text-5xl font-bold text-white/10 mb-6 absolute top-4 right-4">01</div>
              <h3 className="text-xl font-bold text-white mb-4">Membership</h3>
              <h4 className="text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">Acquire Governance Stake</h4>
              <p className="text-gray-400 leading-relaxed">
                Participants acquire Thrive Realms Tokens (TRS), granting tier-based access to governance, proposals, and economic participation within the protocol.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-8 bg-black border border-white/10 rounded-lg h-full">
              <div className="text-5xl font-bold text-white/10 mb-6 absolute top-4 right-4">02</div>
              <h3 className="text-xl font-bold text-white mb-4">Governance</h3>
              <h4 className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-4">Direct Capital Allocation</h4>
              <p className="text-gray-400 leading-relaxed">
                Token holders submit proposals, vote on capital deployment, approve execution teams, and oversee treasury movements through transparent, on-chain governance.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-8 bg-black border border-white/10 rounded-lg h-full">
              <div className="text-5xl font-bold text-white/10 mb-6 absolute top-4 right-4">03</div>
              <h3 className="text-xl font-bold text-white mb-4">Prosperity</h3>
              <h4 className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">Shared Economic Outcomes</h4>
              <p className="text-gray-400 leading-relaxed">
                Approved initiatives generate economic activity. Returns may be redistributed, reinvested, or retained according to governance decisions and treasury strategy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
