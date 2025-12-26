'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../lib/contracts';
import { useWallet } from '../../hooks/useWallet';
import { Building2, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function EntityStatusWidget() {
    const { provider, account } = useWallet();
    const [status, setStatus] = useState<'None' | 'Pending' | 'Verified' | 'Inactive'>('None');
    const [name, setName] = useState('');

    useEffect(() => {
        if (provider && account) checkStatus();
    }, [provider, account]);

    async function checkStatus() {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);
            // Check if account is a registered company
            const company = await registry.getCompany(account);
            if (company && company.name) {
                setName(company.name);
                if (company.isVerified) setStatus('Verified');
                else if (company.isPending) setStatus('Pending');
                else if (company.addr !== ethers.ZeroAddress) setStatus('Inactive'); // Assuming struct has addr or we rely on name check
                // Note: If map returns empty struct for non-existent, name will be empty.
            }
        } catch (e) {
            // Ignore if not found
        }
    }

    if (status === 'None') return null;

    return (
        <div className={`glass-card p-6 border-l-4 ${status === 'Verified' ? 'border-green-500' : 'border-yellow-500'}`}>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Entity Status</p>
            <div className="flex items-center gap-2 mb-1">
                <Building2 size={20} className={status === 'Verified' ? 'text-green-400' : 'text-yellow-400'} />
                <p className="text-xl font-bold text-white truncate">{name}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono opacity-80">
                {status === 'Verified' && <><CheckCircle size={12} className="text-green-500" /> <span className="text-green-400">Verified Partner</span></>}
                {status === 'Pending' && <><Clock size={12} className="text-yellow-500" /> <span className="text-yellow-400">Awaiting Governance</span></>}
                {status === 'Inactive' && <><XCircle size={12} className="text-red-500" /> <span className="text-red-400">Inactive</span></>}
            </div>
        </div>
    );
}
