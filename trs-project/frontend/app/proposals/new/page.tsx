'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Plus, Trash, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle, ShieldCheck, Building2, Wallet, Users, Globe, Briefcase, DollarSign, Banknote } from 'lucide-react';

const CATEGORIES = [
    "Treasury Investment", "Execution Entity Approval", "Job / Contractor Engagement",
    "Physical Project Development", "Infrastructure / Protocol Upgrade",
    "Strategic Partnership"
];

const EXECUTION_MODELS = ["Approved Company", "Approved Individual", "Internal DAO Execution"];

// Proposal Types mapped to User's Architecture
type ProposalType = 'ENTITY' | 'FUNDING' | 'OPPORTUNITY' | 'FAST_TRACK' | 'FIAT_BRIDGE' | 'EXECUTION_POD';

function NewProposalContent() {
    const { provider, signer, account } = useWallet();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [step, setStep] = useState(1);
    const [type, setType] = useState<ProposalType>('ENTITY');
    const [loading, setLoading] = useState(false);
    const [userTier, setUserTier] = useState('');
    const [reputation, setReputation] = useState(0);

    // --- FORM DATA ---
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');

    // Type A/D/E: Entity / Bridge / Pod
    const [entityName, setEntityName] = useState('');
    const [entityAddress, setEntityAddress] = useState('');
    const [entityUrl, setEntityUrl] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');

    // Type B: Funding
    const [budget, setBudget] = useState('');
    const [milestones, setMilestones] = useState<{ desc: string, amount: string }[]>([{ desc: 'Initial Tranche', amount: '' }]);
    const [executor, setExecutor] = useState('');

    // Type C: Opportunity
    const [oppMarket, setOppMarket] = useState('');
    const [oppRegion, setOppRegion] = useState('');
    const [oppContact, setOppContact] = useState('');

    useEffect(() => {
        if (provider && account) {
            checkEligibility();
            fetchReputation();
        }
        // Auto-select type from URL
        const t = searchParams.get('type');
        if (t === 'entity') setType('ENTITY');
        if (t === 'funding') setType('FUNDING');
        if (t === 'opportunity') setType('OPPORTUNITY');
        if (t === 'fast_track') setType('FAST_TRACK');
    }, [provider, account, searchParams]);

    async function checkEligibility() {
        if (!provider || !account) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const bal = await token.getVotes(account);
            const balNum = parseFloat(ethers.formatEther(bal));
            if (balNum >= 25000) setUserTier('Founder'); // 24k threshold + buffer
            else if (balNum >= 12000) setUserTier('Voter');
            else setUserTier('Member');
        } catch (e) {
            console.error("Eligibility check failed", e);
        }
    }

    async function fetchReputation() {
        if (!provider || !account) return;
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_REGISTRY, CONTRACT_ABIS.ReputationRegistry, provider);
            const score = await registry.getScore(account);
            setReputation(Number(score));
        } catch (e) {
            console.error("Reputation check failed", e);
        }

    }

    const typeConfig: Record<ProposalType, { title: string, desc: string, icon: any, color: string }> = {
        'ENTITY': {
            title: "Standard Verification",
            desc: "Whitelist a new Execution Partner (Company/Individual).",
            icon: <Building2 size={32} />,
            color: "blue"
        },
        'FUNDING': {
            title: "Request Funding",
            desc: "Propose a funded mandate with budget, milestones, and assigned executor.",
            icon: <Wallet size={32} />,
            color: "green"
        },
        'OPPORTUNITY': {
            title: "List Opportunity",
            desc: "Submit an investment opportunity to the Intelligence Vault (No immediate funding).",
            icon: <Globe size={32} />,
            color: "purple"
        },
        'FAST_TRACK': {
            title: "Fast Track Funding",
            desc: "Accelerated funding for high-reputation partners (Score > 80 required).",
            icon: <ShieldCheck size={32} />,
            color: "orange"
        },
        'FIAT_BRIDGE': {
            title: "Fiat Bridge Authorization",
            desc: "Authorize a new Fiat On/Off-Ramp Provider under strict policy controls.",
            icon: <Banknote size={32} />,
            color: "cyan"
        },
        'EXECUTION_POD': {
            title: "Execution Pod Creation",
            desc: "Spin up a dedicated sub-DAO (Pod) for specific geographic/sector mandates.",
            icon: <Users size={32} />,
            color: "pink"
        }
    };

    const generateMarkdown = () => {
        const date = new Date().toISOString().split('T')[0];
        let md = `# ${title}\n\n`;
        md += `| Metadata | |\n| :--- | :--- |\n| **Type** | ${type} |\n| **Author** | ${account} |\n| **Date** | ${date} |\n\n`;

        md += `## Executive Summary\n${summary}\n\n`;

        if (type === 'ENTITY' || type === 'FIAT_BRIDGE' || type === 'EXECUTION_POD') {
            md += `## Entity Details\n- **Name:** ${entityName}\n- **Wallet:** \`${entityAddress}\`\n- **Jurisdiction:** ${jurisdiction}\n- **Website:** ${entityUrl}\n\n`;
            md += `## Mandate Scope\nAuthorized Execution Entity.`;
        }
        else if (type === 'FUNDING' || type === 'FAST_TRACK') {
            md += `## ${type === 'FAST_TRACK' ? 'Fast Track ' : ''}Funding Request\n- **Total Budget:** ${budget} TRS\n- **Executor:** \`${executor}\`\n\n`;
            md += `## Milestones\n`;
            milestones.forEach((m, i) => md += `1. **${m.desc}**: ${m.amount} TRS\n`);
        }
        else if (type === 'OPPORTUNITY') {
            md += `## Market Intelligence\n- **Market Size:** ${oppMarket}\n- **Region:** ${oppRegion}\n- **Contact:** ${oppContact}\n`;
        }

        md += `\n\n---\n**Declaration**: I confirm this proposal adheres to the Thrive Realms Governance Framework.`;
        return md;
    };

    const submitProposal = async () => {
        if (!signer) return;
        setLoading(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const description = generateMarkdown();

            let targets: string[] = [];
            let values: number[] = [];
            let calldatas: string[] = [];

            if (type === 'ENTITY' || type === 'FIAT_BRIDGE' || type === 'EXECUTION_POD') {
                // TYPE A/D/E: Execute registerEntity on Registry
                // registerEntity(address, type, name, jurisdiction, metadata)
                const regInterface = new ethers.Interface(CONTRACT_ABIS.ExecutionRegistry);

                let typeEnum = 1; // STANDARD
                if (type === 'FIAT_BRIDGE') typeEnum = 2;
                if (type === 'EXECUTION_POD') typeEnum = 3;

                const data = regInterface.encodeFunctionData("registerEntity", [
                    entityAddress,
                    typeEnum,
                    entityName,
                    jurisdiction,
                    entityUrl // passing URL as metadata for now
                ]);

                targets = [CONTRACT_ADDRESSES.EXECUTION_REGISTRY];
                values = [0];
                calldatas = [data];
            }
            else if (type === 'OPPORTUNITY') {
                // TYPE C: Submit to Vault
                // submitOpportunity(name, country, fundingAsk, contact, ipfs)
                const vaultInterface = new ethers.Interface(CONTRACT_ABIS.OpportunityRegistry);
                const data = vaultInterface.encodeFunctionData("submitOpportunity", [
                    title, oppRegion, "N/A", oppContact, "ipfs://placeholder"
                ]);

                targets = [CONTRACT_ADDRESSES.OPPORTUNITY_REGISTRY];
                values = [0];
                calldatas = [data];
            }
            else {
                // TYPE B & FAST_TRACK: Funding - Batch Execution (Approve + CreateProject)
                // 1. Calculate Total Budget
                let totalBudget = BigInt(0);
                const milestoneAmounts: BigInt[] = [];
                const milestoneDescs: string[] = [];

                milestones.forEach(m => {
                    const amtWei = ethers.parseEther(m.amount);
                    totalBudget += amtWei;
                    milestoneAmounts.push(amtWei);
                    milestoneDescs.push(m.desc);
                });

                // 2. Generate Calldata for Action 1: Token.approve(Factory, Total)
                const tokenInterface = new ethers.Interface(CONTRACT_ABIS.TRSToken);
                const approveData = tokenInterface.encodeFunctionData("approve", [
                    CONTRACT_ADDRESSES.PROJECT_FACTORY,
                    totalBudget.toString()
                ]);

                // 3. Generate Calldata for Action 2: Factory.createProject(...)
                const factoryInterface = new ethers.Interface(CONTRACT_ABIS.ProjectFactory);

                // projectID generation (timestamp + random suffix for uniqueness)
                const projId = `PRJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                const createData = factoryInterface.encodeFunctionData("createProject", [
                    projId,
                    title,
                    "General Funding", // Category placeholder
                    "Global",          // Country placeholder
                    "DAO",             // Region placeholder
                    executor,          // The Executor Wallet
                    CONTRACT_ADDRESSES.TOKEN, // Budget Token
                    milestoneAmounts,
                    milestoneDescs
                ]);

                // 4. Construct Batch Proposal
                targets = [CONTRACT_ADDRESSES.TOKEN, CONTRACT_ADDRESSES.PROJECT_FACTORY];
                values = [0, 0];
                calldatas = [approveData, createData];
            }

            const tx = await gov.propose(targets, values, calldatas, description);
            await tx.wait();
            router.push('/governance');

        } catch (e: any) {
            console.error(e);
            alert("Proposal Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    };

    if (!account) return <div className="flex h-[50vh] items-center justify-center text-gray-500">Please Connect Wallet</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* HEADER */}
            <div className="mb-8">
                <button onClick={() => router.back()} className="text-gray-500 hover:text-white mb-4 flex items-center gap-1"><ChevronLeft size={16} /> Cancel</button>
                <h1 className="text-4xl font-serif text-white mb-2">New Governance Proposal</h1>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${userTier === 'Founder' ? 'bg-purple-900 text-purple-200 border border-purple-500' : 'bg-gray-800 text-gray-500'}`}>
                        YOUR TIER: {userTier || 'Checking...'}
                    </span>
                    {userTier !== 'Founder' && userTier !== '' && (
                        <span className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle size={12} /> Requires 24,000 VP to Submit</span>
                    )}
                </div>
            </div>

            {/* WIZARD STEPS */}
            <div className="flex gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${step >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
                ))}
            </div>

            <div className="min-h-[400px]">
                {/* STEP 1: TYPE SELECTION */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold text-white mb-6">Select Proposal Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {(Object.keys(typeConfig) as ProposalType[]).map((t) => {
                                const isDisabled = t === 'FAST_TRACK' && reputation < 80;
                                return (
                                    <button key={t}
                                        disabled={isDisabled}
                                        onClick={() => { setType(t); setStep(2); }}
                                        className={`p-6 rounded-xl border transition text-left group relative overflow-hidden ${isDisabled
                                            ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed grayscale'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/50'
                                            }`}
                                    >
                                        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition text-${typeConfig[t].color}-500`}>
                                            {typeConfig[t].icon}
                                        </div>
                                        <div className={`text-${typeConfig[t].color}-400 mb-4`}>{typeConfig[t].icon}</div>
                                        <h3 className="text-xl font-bold text-white mb-2">{typeConfig[t].title}</h3>
                                        <p className="text-sm text-gray-400 mb-2">{typeConfig[t].desc}</p>
                                        {isDisabled && (
                                            <div className="text-xs text-red-400 font-bold bg-red-900/20 py-1 px-2 rounded inline-block">
                                                Requires Rep Score 80+ ({reputation || 0})
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: DETAILS FORM */}
                {step === 2 && (
                    <div className="animate-fadeIn space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Proposal Details</h2>
                            <span className="text-gray-500 font-mono text-sm">{typeConfig[type].title}</span>
                        </div>

                        {/* Common Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Proposal Title</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 transition" placeholder="e.g., Approve TechFlow as Execution Partner" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Detailed Summary</label>
                                <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full h-32 bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500 transition" placeholder="Explain the rationale, benefits, and implementation plan..." />
                            </div>
                        </div>

                        <div className="h-px bg-white/10 my-6" />

                        {/* TYPE A: ENTITY FIELDS */}
                        {type === 'ENTITY' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-blue-400">Execution Partner Info</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Entity Name</label>
                                        <input value={entityName} onChange={e => setEntityName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="Company Ltd" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Wallet Address (To Whitelist)</label>
                                        <input value={entityAddress} onChange={e => setEntityAddress(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" placeholder="0x..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Website / Portfolio</label>
                                    <input value={entityUrl} onChange={e => setEntityUrl(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="https://..." />
                                </div>
                            </div>
                        )}

                        {/* TYPE B: FUNDING FIELDS */}
                        {type === 'FUNDING' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-green-400">Funding Request</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Total Ask (TRS)</label>
                                        <input value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white text-lg font-bold text-green-400" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Executor Wallet</label>
                                        <input value={executor} onChange={e => setExecutor(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" placeholder="0x..." />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Milestones</label>
                                    {milestones.map((m, i) => (
                                        <div key={i} className="flex gap-2 mb-2">
                                            <input value={m.desc} onChange={e => { const n = [...milestones]; n[i].desc = e.target.value; setMilestones(n) }} className="flex-grow bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Description" />
                                            <input value={m.amount} onChange={e => { const n = [...milestones]; n[i].amount = e.target.value; setMilestones(n) }} className="w-32 bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Amount" />
                                        </div>
                                    ))}
                                    <button onClick={() => setMilestones([...milestones, { desc: '', amount: '' }])} className="text-xs text-green-400 hover:text-green-300">+ Add Milestone</button>
                                </div>
                            </div>
                        )}

                        {/* TYPE C: OPPORTUNITY FIELDS */}
                        {type === 'OPPORTUNITY' && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-purple-400">Market Intelligence</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Region / Country</label>
                                        <input value={oppRegion} onChange={e => setOppRegion(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Est. Market Size</label>
                                        <input value={oppMarket} onChange={e => setOppMarket(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Sponsor Contact Info</label>
                                    <input value={oppContact} onChange={e => setOppContact(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="Email or Telegram" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 3 && (
                    <div className="animate-fadeIn space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Confirm & Submit</h2>
                        <div className="p-6 bg-white/5 rounded border border-white/10">
                            <h3 className="text-xl font-serif text-white mb-2">{title}</h3>
                            <div className="prose prose-invert max-w-none text-sm text-gray-400 whitespace-pre-wrap font-mono bg-black/30 p-4 rounded">
                                {generateMarkdown()}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded">
                            <AlertTriangle className="text-yellow-500" />
                            <div className="text-sm text-yellow-200">
                                <strong>On-Chain Action:</strong>
                                {type === 'ENTITY' && " This proposal will AUTOMATICALLY whitelist the wallet address upon passing."}
                                {type === 'OPPORTUNITY' && " This proposal will publish the opportunity to the Intelligence Vault."}
                                {type === 'FUNDING' && " This proposal will request a funding allocation from the Treasury."}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NAVIGATION ACTIONS */}
            <div className="flex justify-between mt-8 border-t border-white/10 pt-6">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-2 rounded bg-white/5 hover:bg-white/10 text-white disabled:opacity-0 transition">Back</button>
                {step < 3 ? (
                    <button onClick={() => setStep(s => s + 1)} className="px-8 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-2">Next <ChevronRight size={16} /></button>
                ) : (
                    <button onClick={submitProposal} disabled={loading} className="px-8 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition flex items-center gap-2">
                        {loading ? 'Processing...' : 'Submit to DAO'} <ShieldCheck size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function NewProposalPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading...</div>}>
            <NewProposalContent />
        </Suspense>
    );
}
