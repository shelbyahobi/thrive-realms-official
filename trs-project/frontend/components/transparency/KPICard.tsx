import React from 'react';
import { Wallet, Shield, CheckCircle, Vote } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: string;
    sub: string;
    icon: 'Wallet' | 'Shield' | 'Check' | 'Vote';
    color?: string;
}

const icons = {
    Wallet: Wallet,
    Shield: Shield,
    Check: CheckCircle,
    Vote: Vote
};

export function KPICard({ title, value, sub, icon, color = "purple" }: KPICardProps) {
    const Icon = icons[icon];

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className={`w-12 h-12 rounded-lg bg-${color}-500/20 flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 text-${color}-400`} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {sub}
            </div>
        </div>
    );
}
