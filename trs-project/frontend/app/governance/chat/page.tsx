'use client';
import { useState, useEffect, useRef } from 'react';
import { useWallet } from '../../../hooks/useWallet';
import { ethers, formatEther } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { Lock, Send, Hash, Users, Shield } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    sender: string;
    text: string;
    timestamp: number;
    tier: string;
}

const CHANNELS = [
    { id: 'general', name: 'General Lounge', icon: Hash, minTier: 'Voter' },
    { id: 'proposals', name: 'Proposal Diligence', icon: File, minTier: 'Voter' },
    { id: 'execution', name: 'Execution Ops', icon: Shield, minTier: 'Founder' },
    { id: 'treasury', name: 'Treasury Audit', icon: Lock, minTier: 'Founder' }
];

export default function SecureChatPage() {
    const { account, provider } = useWallet();
    const [tier, setTier] = useState<string>('Guest');
    const [loading, setLoading] = useState(true);
    const [activeChannel, setActiveChannel] = useState('general');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (account && provider) {
            checkAccess();
        } else {
            setLoading(false);
        }
    }, [account, provider]);

    useEffect(() => {
        // Scroll to bottom on new message
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mock initial messages
    useEffect(() => {
        setMessages([
            { id: '1', sender: '0x123...456', text: 'Has anyone reviewed the latest yield report?', timestamp: Date.now() - 100000, tier: 'Founder' },
            { id: '2', sender: '0xABC...DEF', text: 'Yes, looking good. The new vault integration is seamless.', timestamp: Date.now() - 50000, tier: 'Voter' },
        ]);
    }, []);

    async function checkAccess() {
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const bal = await token.balanceOf(account);
            const balNum = parseFloat(formatEther(bal));

            let t = "Guest";
            if (balNum >= 24000) t = "Founder";
            else if (balNum >= 12000) t = "Voter";
            else if (balNum >= 1200) t = "Member";

            setTier(t);
        } catch (e) {
            console.error("Error checking tier", e);
        } finally {
            setLoading(false);
        }
    }

    const handleSend = () => {
        if (!inputText.trim()) return;
        const newMsg: Message = {
            id: Date.now().toString(),
            sender: account?.substring(0, 6) + '...' + account?.substring(38) || 'Anon',
            text: inputText,
            timestamp: Date.now(),
            tier: tier
        };
        setMessages([...messages, newMsg]);
        setInputText('');
    };

    const hasAccess = (channelMinTier: string) => {
        const tiers = ['Guest', 'Member', 'Voter', 'Founder'];
        const userLevel = tiers.indexOf(tier);
        const reqLevel = tiers.indexOf(channelMinTier);
        return userLevel >= reqLevel;
    };

    if (loading) return <div className="p-20 text-center text-gray-400">Verifying Clearance...</div>;

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Shield className="w-16 h-16 text-gray-600 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Secure Channel Access</h1>
                <p className="text-gray-400 mb-6">Please connect your wallet to verify your security clearance.</p>
            </div>
        );
    }

    if (tier === 'Guest' || tier === 'Member') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Lock className="w-16 h-16 text-red-500/50 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-6 max-w-md">
                    This secure communication terminal is restricted to <span className="text-blue-400 font-bold">Voter</span> and <span className="text-purple-400 font-bold">Founder</span> tiers only.
                </p>
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-300">Your Current Tier: <span className="font-bold uppercase">{tier}</span></p>
                </div>
                <Link href="/dashboard" className="mt-8 text-gray-400 hover:text-white underline">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="text-green-500" /> Secure Ops Center
                </h1>
                <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Encrypted Connection Active
                </div>
            </div>

            <div className="flex flex-1 glass-card border border-white/10 overflow-hidden rounded-xl">
                {/* Sidebar */}
                <div className="w-64 bg-black/20 border-r border-white/5 flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channels</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {CHANNELS.map(ch => {
                            const locked = !hasAccess(ch.minTier);
                            return (
                                <button
                                    key={ch.id}
                                    onClick={() => !locked && setActiveChannel(ch.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left transition ${activeChannel === ch.id ? 'bg-blue-500/20 text-white' :
                                            locked ? 'opacity-50 cursor-not-allowed text-gray-500' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    {locked ? <Lock size={14} /> : <Hash size={14} />}
                                    <span className="text-sm font-medium">{ch.name}</span>
                                    {locked && <span className="ml-auto text-[10px] border border-gray-600 px-1 rounded">{ch.minTier}+</span>}
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-4 bg-black/40 border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                                {account.substring(2, 4)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm text-white font-bold truncate">{account.substring(0, 8)}...</p>
                                <p className="text-xs text-purple-400 uppercase">{tier}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-black/10">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <h2 className="text-white font-bold flex items-center gap-2">
                            <Hash className="text-gray-400" size={18} />
                            {CHANNELS.find(c => c.id === activeChannel)?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <Users size={14} />
                            <span>12 Online</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex gap-3 group">
                                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold text-xs ${msg.tier === 'Founder' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'
                                    }`}>
                                    {msg.sender.substring(2, 4)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-sm font-bold ${msg.tier === 'Founder' ? 'text-purple-400' : 'text-blue-400'
                                            }`}>{msg.sender}</span>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 bg-white/5 border-t border-white/5">
                        <div className="flex items-center gap-2 bg-black/30 p-2 rounded-lg border border-white/10 focus-within:border-blue-500/50 transition">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={`Message #${CHANNELS.find(c => c.id === activeChannel)?.name}...`}
                                className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-gray-500"
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 text-center">
                            Messages are E2E encrypted and signed by your wallet. (Simulation Mode)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
