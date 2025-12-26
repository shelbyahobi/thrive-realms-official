'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useState } from 'react';

export default function Navbar() {
    const { account, connect } = useWallet();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const links = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Governance', href: '/governance' },
        { name: 'Work', href: '/work' },
        { name: 'Whitepaper', href: '/whitepaper' },
    ];

    return (
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-purple-300 transition text-white">
                    <Activity className="text-purple-500" />
                    Thrive Realms
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    {links.map(l => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className={`text-sm font-medium transition-colors hover:text-white ${pathname.startsWith(l.href) ? 'text-purple-400' : 'text-gray-400'
                                }`}
                        >
                            {l.name}
                        </Link>
                    ))}
                </div>

                {/* Wallet / Mobile Toggle */}
                <div className="flex items-center gap-4">
                    {!account ? (
                        <button onClick={connect} className="btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                            <Wallet size={16} /> Connect
                        </button>
                    ) : (
                        <div className="hidden md:block px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-purple-300">
                            {account.substring(0, 6)}...{account.substring(38)}
                        </div>
                    )}

                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 bg-black p-4 space-y-4">
                    {links.map(l => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-gray-300 hover:text-white py-2"
                        >
                            {l.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
