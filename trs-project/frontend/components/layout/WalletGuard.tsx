'use client';

import { useWallet } from '../../hooks/useWallet';
import { Wallet, Lock } from 'lucide-react';

interface WalletGuardProps {
    children: React.ReactNode;
}

export default function WalletGuard({ children }: WalletGuardProps) {
    const { account, connectWallet } = useWallet();

    if (!account) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <Lock size={48} className="text-gray-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
                <p className="text-gray-400 max-w-md mb-8">
                    This section requires an active secure connection to the Thrive Realms Protocol. Please connect your wallet to verify your identity.
                </p>
                <button
                    onClick={connectWallet}
                    className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:scale-105"
                >
                    <Wallet size={20} /> Connect Wallet
                </button>
            </div>
        );
    }

    return <>{children}</>;
}
