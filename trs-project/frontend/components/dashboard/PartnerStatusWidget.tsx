'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Shield, ShieldCheck, Clock, ArrowRight, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function PartnerStatusWidget() {
    const { account, provider } = useWallet();
    const [status, setStatus] = useState<'none' | 'pending' | 'verified'>('none');
    const [companyName, setCompanyName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (account && provider) checkStatus();
    }, [account, provider]);

    async function checkStatus() {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);

            // Check if user is a registered company wallet
            // The registry assumes 1-to-1 mapping? Or allows lookup by address?
            // "getCompany(address)" returns struct.

            const struct = await registry.getCompany(account);

            // If name is empty, likely not registered (assuming default return)
            if (!struct.name) {
                setStatus('none');
            } else {
                setCompanyName(struct.name);
                if (struct.isVerified) setStatus('verified');
                else setStatus('pending');
            }
        } catch (e) {
            // Address might not be a company
            setStatus('none');
        }
        setLoading(false);
    }

    if (loading) return <div className="glass-card p-6 h-full animate-pulse bg-white/5"></div>;

    return (
        <div className="glass-card p-6 h-full flex flex-col justify-between border-l-4 border-l-purple-500 group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-500/10 p-2 rounded-lg">
                    {status === 'verified' ? <ShieldCheck className="text-green-400" size={24} /> :
                        status === 'pending' ? <Clock className="text-yellow-400" size={24} /> :
                            <Shield className="text-purple-400" size={24} />}
                </div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Partner Status</span>
            </div>

            <div>
                {status === 'none' && (
                    <>
                        <h3 className="text-xl font-bold text-white mb-2">Become a Partner</h3>
                        <p className="text-sm text-gray-400">Register to execute paid mandates.</p>
                    </>
                )}
                {status === 'pending' && (
                    <>
                        <h3 className="text-xl font-bold text-white mb-1">{companyName}</h3>
                        <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                            <Clock size={14} /> Pending Approval
                        </div>
                    </>
                )}
                {status === 'verified' && (
                    <>
                        <h3 className="text-xl font-bold text-white mb-1">{companyName}</h3>
                        <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                            <ShieldCheck size={14} /> Verified Partner
                        </div>
                    </>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 mt-4">
                {status === 'none' ? (
                    <Link href="/companies/register" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                        Register Entity <ArrowRight size={16} />
                    </Link>
                ) : status === 'pending' ? (
                    <Link href="/governance" className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold">
                        Track Approval <ArrowRight size={16} />
                    </Link>
                ) : (
                    <Link href="/proposals/new" className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1 font-bold">
                        New Mandate <PlusCircle size={16} />
                    </Link>
                )}
            </div>
        </div>
    );
}
