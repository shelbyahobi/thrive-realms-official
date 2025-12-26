'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Loader2, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Company {
    address: string;
    name: string;
    metadataURI: string;
    isVerified: boolean;
    isPending: boolean;
    website: string;
    description: string;
}

export default function CompanyList() {
    const { provider } = useWallet();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (provider) fetchCompanies();
    }, [provider]);

    async function fetchCompanies() {
        if (!provider) return;
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);

            // 1. Get All Addresses
            // Note: In production this should be paginated or indexed.
            const allAddresses: string[] = await registry.getAllCompanies();

            // 2. Fetch Details for each
            const list = await Promise.all(allAddresses.map(async (addr: string) => {
                const struct = await registry.getCompany(addr);
                let meta = { website: '', description: '' };
                try {
                    meta = JSON.parse(struct.metadataURI);
                } catch (e) {
                    // Legacy Format Fallback
                    if (struct.metadataURI.includes('|')) {
                        const parts = struct.metadataURI.split('|');
                        meta.description = parts[0];
                        meta.website = parts[2];
                    }
                }

                return {
                    address: addr,
                    name: struct.name,
                    metadataURI: struct.metadataURI,
                    isVerified: struct.isVerified,
                    isPending: struct.isPending,
                    website: meta.website,
                    description: meta.description
                };
            }));

            // Sort: Verified First, then Pending, then others
            // Only Verified and Pending are relevant usually.
            setCompanies(list);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-purple-500" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Execution Partners</h2>
                    <p className="text-gray-400">Verified entities eligible to receive DAO mandates.</p>
                </div>
                <Link href="/companies/register" className="btn btn-primary px-6 py-2">
                    <ShieldCheck size={18} className="mr-2" /> Register Entity
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.length === 0 && (
                    <div className="col-span-full text-center p-12 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-500">No registered companies found.</p>
                    </div>
                )}

                {companies.map((c) => (
                    <div key={c.address} className="glass-card p-6 border-l-4 border-l-transparent hover:border-l-purple-500 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{c.name}</h3>
                            {c.isVerified ? (
                                <span className="flex items-center gap-1 text-green-400 text-xs font-bold uppercase border border-green-500/30 px-2 py-1 rounded bg-green-900/20">
                                    <CheckCircle size={12} /> Verified
                                </span>
                            ) : c.isPending ? (
                                <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold uppercase border border-yellow-500/30 px-2 py-1 rounded bg-yellow-900/20">
                                    <Clock size={12} /> Pending Vote
                                </span>
                            ) : (
                                <span className="text-gray-500 text-xs font-bold uppercase px-2 py-1 rounded bg-gray-900">
                                    Inactive
                                </span>
                            )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-3 h-14">
                            {c.description || "No description provided."}
                        </p>

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                            <span>{c.address.substring(0, 8)}...</span>
                            {c.website && <a href={c.website} target="_blank" className="text-purple-400 hover:text-purple-300">Visit Website</a>}
                        </div>

                        {c.isPending && (
                            <Link
                                href={`/proposals/new?type=company_approval&address=${c.address}`}
                                className="mt-4 block w-full text-center py-2 rounded bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-sm transition"
                            >
                                Create Approval Proposal
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
