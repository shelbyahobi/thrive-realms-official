'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Plus, Trash, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle, ShieldCheck, Building2, Wallet, Users, Globe, Briefcase, DollarSign, Banknote, Scale } from 'lucide-react';
import WalletGuard from '../../../components/layout/WalletGuard';

const JURISDICTIONS = [
    "United States", "United Kingdom", "Germany", "France", "Switzerland",
    "Singapore", "United Arab Emirates", "Japan", "Cayman Islands",
    "British Virgin Islands", "Estonia", "Global (DAO)"
];

type ProposalType = 'ENTITY' | 'FUNDING' | 'OPPORTUNITY' | 'FAST_TRACK' | 'FIAT_BRIDGE' | 'EXECUTION_POD' | 'LEGAL_STRUCTURE' | 'LEGAL_SETUP_FUNDING' | 'PROJECT_FUNDING';

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

    // Global DAO State
    const [daoPhase, setDaoPhase] = useState<number>(0);
    const [activeLegalStructure, setActiveLegalStructure] = useState<any>(null);

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

    // Phase 1: Legal Structure
    const [legalType, setLegalType] = useState('DAO-Controlled LLC');
    const [legalJurisdiction, setLegalJurisdiction] = useState('Wyoming (DAO-LLC)');
    const [legalScope, setLegalScope] = useState<string[]>([]);
    const [legalControl, setLegalControl] = useState('Multisig');
    const [legalBudget, setLegalBudget] = useState('');
    const [legalFacilitator, setLegalFacilitator] = useState('');

    // Phase 2: Legal Setup Funding
    const [setupAmount, setSetupAmount] = useState('');
    const [expenseBreakdown, setExpenseBreakdown] = useState<{ category: string, desc: string, amount: string }[]>([
        { category: 'Legal', desc: 'Incorporation', amount: '' },
        { category: 'Banking', desc: 'Account Setup', amount: '' },
        { category: 'Compliance', desc: 'Advisory', amount: '' }
    ]);
    const [setupExecutorType, setSetupExecutorType] = useState('Facilitator');
    const [setupExecutorWallet, setSetupExecutorWallet] = useState('');
    const [reportingCommitment, setReportingCommitment] = useState(false);

    // Phase 3: Fiat Bridge & Pods
    const [bridgeLicense, setBridgeLicense] = useState('');
    const [bridgeCap, setBridgeCap] = useState('');
    const [podMandate, setPodMandate] = useState('Geographic');
    const [podTreasury, setPodTreasury] = useState('');
    const [podCap, setPodCap] = useState('');

    useEffect(() => {
        if (provider && account) {
            checkEligibility();
            fetchReputation();
            fetchDaoState();
        }
        const t = searchParams.get('type');
        if (t === 'entity') setType('ENTITY');
        if (t === 'funding') setType('FUNDING');
        if (t === 'opportunity') setType('OPPORTUNITY');
        if (t === 'fast_track') setType('FAST_TRACK');
    }, [provider, account, searchParams]);

    async function fetchDaoState() {
        if (!provider) return;
        try {
            const govSettings = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNANCE_SETTINGS, CONTRACT_ABIS.GovernanceSettings, provider);
            const phase = await govSettings.currentPhase();
            setDaoPhase(Number(phase));
            const structure = await govSettings.getLegalStructure();
            setActiveLegalStructure({
                type: Number(structure.structureType),
                jurisdiction: structure.jurisdiction,
                budget: ethers.formatEther(structure.setupBudget),
                facilitator: structure.facilitator
            });
        } catch (e) { console.error(e); }
    }

    async function checkEligibility() {
        if (!provider || !account) return;
        try {
            const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
            const bal = await token.getVotes(account);
            const balNum = parseFloat(ethers.formatEther(bal));
            if (balNum >= 25000) setUserTier('Founder');
            else if (balNum >= 12000) setUserTier('Voter');
            else setUserTier('Member');
        } catch (e) { console.error(e); }
    }

    async function fetchReputation() {
        if (!provider || !account) return;
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.REPUTATION_REGISTRY, CONTRACT_ABIS.ReputationRegistry, provider);
            const score = await registry.getScore(account);
            setReputation(Number(score));
        } catch (e) { console.error(e); }
    }

    // --- VALIDATION LOGIC ---
    const validateEntity = () => {
        if (!entityName || !entityAddress || !jurisdiction) {
            alert("Please complete all Entity fields (Name, Address, Jurisdiction).");
            return false;
        }
        if (!ethers.isAddress(entityAddress)) {
            alert("Invalid Entity Wallet Address");
            return false;
        }
        return true;
    };

    const validateFunding = () => {
        if (Number(budget) <= 0 || !executor) {
            alert("Budget must be > 0 and Executor required.");
            return false;
        }
        if (!ethers.isAddress(executor)) {
            alert("Invalid Executor Address");
            return false;
        }
        return true;
    };

    const validateOpportunity = () => {
        const phoneRegex = /^\+?[0-9]{7,15}$/;
        // Simple check: Email (@) OR Phone (+)
        if (oppContact && !oppContact.includes('@') && !phoneRegex.test(oppContact)) {
            alert("Contact must be valid Email or Phone (+1234567890)");
            return false;
        }
        if (!oppRegion || !oppMarket) {
            alert("Please fill in Market & Region info");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
            return;
        }
    };

    const handleSubmit = () => {
        // Run validation based on type
        if (type === 'ENTITY' && !validateEntity()) return;
        if ((type === 'FUNDING' || type === 'PROJECT_FUNDING') && !validateFunding()) return;
        if (type === 'OPPORTUNITY' && !validateOpportunity()) return;

        submitProposal();
    };

    // FIXED: Static classes to avoid Tailwind build errors with dynamic template literals
    const typeConfig: Record<ProposalType, { title: string, desc: string, icon: any, activeClasses: string, textClass: string }> = {
        'ENTITY': {
            title: "Standard Verification", desc: "Whitelist a new Execution Partner.", icon: <Building2 />,
            activeClasses: "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/30", textClass: "text-blue-400"
        },
        'FUNDING': {
            title: "Request Funding", desc: "Propose a funded mandate.", icon: <Wallet />,
            activeClasses: "bg-green-600/20 border-green-500 shadow-lg shadow-green-500/30", textClass: "text-green-400"
        },
        'OPPORTUNITY': {
            title: "List Opportunity", desc: "Submit to Intelligence Vault.", icon: <Globe />,
            activeClasses: "bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/30", textClass: "text-purple-400"
        },
        'FAST_TRACK': {
            title: "Fast Track Funding", desc: "Accelerated funding.", icon: <ShieldCheck />,
            activeClasses: "bg-orange-600/20 border-orange-500 shadow-lg shadow-orange-500/30", textClass: "text-orange-400"
        },
        'FIAT_BRIDGE': {
            title: "Fiat Bridge Authorization", desc: "Authorize On/Off-Ramp.", icon: <Banknote />,
            activeClasses: "bg-cyan-600/20 border-cyan-500 shadow-lg shadow-cyan-500/30", textClass: "text-cyan-400"
        },
        'EXECUTION_POD': {
            title: "Execution Pod Creation", desc: "Spin up sub-DAO Pod.", icon: <Users />,
            activeClasses: "bg-pink-600/20 border-pink-500 shadow-lg shadow-pink-500/30", textClass: "text-pink-400"
        },
        'LEGAL_STRUCTURE': {
            title: "Legal Establishment", desc: "Define DAO Legal Entity.", icon: <Scale />,
            activeClasses: "bg-yellow-600/20 border-yellow-500 shadow-lg shadow-yellow-500/30", textClass: "text-yellow-400"
        },
        'LEGAL_SETUP_FUNDING': {
            title: "Legal Funding", desc: "Fund incorporation costs.", icon: <Briefcase />,
            activeClasses: "bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/30", textClass: "text-emerald-400"
        },
        'PROJECT_FUNDING': {
            title: "Project Execution", desc: "Fund real-world project.", icon: <Building2 />,
            activeClasses: "bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/30", textClass: "text-blue-400"
        }
    };

    const generateMarkdown = () => {
        const date = new Date().toISOString().split('T')[0];
        let md = `# ${title}\n\n| Metadata | |\n| :--- | :--- |\n| **Type** | ${type} |\n| **Author** | ${account} |\n| **Date** | ${date} |\n\n## Executive Summary\n${summary}\n\n`;
        if (type === 'ENTITY' || type === 'FIAT_BRIDGE' || type === 'EXECUTION_POD') {
            md += `## Entity Details\n- **Name:** ${entityName}\n- **Wallet:** \`${entityAddress}\`\n- **Jurisdiction:** ${jurisdiction}\n- **Website:** ${entityUrl}\n\n## Mandate Scope\nAuthorized Execution Entity.`;
        } else if (type === 'FUNDING' || type === 'FAST_TRACK' || type === 'PROJECT_FUNDING') {
            md += `## Funding Request\n- **Total Budget:** ${budget} TRS\n- **Executor:** \`${executor}\`\n\n## Milestones\n`;
            milestones.forEach((m) => md += `1. **${m.desc}**: ${m.amount} TRS\n`);
        } else if (type === 'OPPORTUNITY') {
            md += `## Market Intelligence\n- **Market Size:** ${oppMarket}\n- **Region:** ${oppRegion}\n- **Contact:** ${oppContact}\n`;
        }
        md += `\n\n---\n**Declaration**: Confirmed via Thrive Realms Protocol.`;
        return md;
    };

    const submitProposal = async () => {
        if (!signer) return;
        setLoading(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const description = generateMarkdown();
            let targets: string[] = [], values: number[] = [], calldatas: string[] = [];

            if (type === 'ENTITY') {
                const regInterface = new ethers.Interface(CONTRACT_ABIS.ExecutionRegistry);
                const data = regInterface.encodeFunctionData("registerEntity", [entityAddress, 1, entityName, jurisdiction, entityUrl]);
                targets = [CONTRACT_ADDRESSES.EXECUTION_REGISTRY];
                values = [0];
                calldatas = [data];
            } else if (type === 'FUNDING' || type === 'PROJECT_FUNDING') {
                let totalBudget = BigInt(0);
                const milestoneAmounts: BigInt[] = [];
                const milestoneDescs: string[] = [];
                milestones.forEach(m => {
                    const amtWei = ethers.parseEther(m.amount);
                    totalBudget += amtWei;
                    milestoneAmounts.push(amtWei);
                    milestoneDescs.push(m.desc);
                });
                const tokenInterface = new ethers.Interface(CONTRACT_ABIS.TRSToken);
                const approveData = tokenInterface.encodeFunctionData("approve", [CONTRACT_ADDRESSES.PROJECT_FACTORY, totalBudget.toString()]);
                const factoryInterface = new ethers.Interface(CONTRACT_ABIS.ProjectFactory);
                const projId = `PRJ-${Date.now()}`;
                const createData = factoryInterface.encodeFunctionData("createProject", [projId, title, "General", jurisdiction || "Global", oppRegion || "DAO", executor, CONTRACT_ADDRESSES.TOKEN, milestoneAmounts, milestoneDescs]);
                targets = [CONTRACT_ADDRESSES.TOKEN, CONTRACT_ADDRESSES.PROJECT_FACTORY];
                values = [0, 0];
                calldatas = [approveData, createData];
            } else if (type === 'OPPORTUNITY') {
                const vaultInterface = new ethers.Interface(CONTRACT_ABIS.OpportunityRegistry);
                const data = vaultInterface.encodeFunctionData("submitOpportunity", [title, oppRegion || "Global", "N/A", oppContact, "ipfs://placeholder"]); // Fixed naming
                targets = [CONTRACT_ADDRESSES.OPPORTUNITY_REGISTRY];
                values = [0];
                calldatas = [data];
            }
            // Add other types as needed (simplified for this fix)

            const tx = await gov.propose(targets, values, calldatas, description);
            await tx.wait();
            router.push('/governance');
        } catch (e: any) {
            console.error(e);
            alert("Proposal Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    };

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
                </div>
            </div>

            {/* STEPS */}
            <div className="flex gap-4 mb-8">
                {[1, 2].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${step >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
                ))}
            </div>

            {/* STEP 1: TYPE */}
            {step === 1 && (
                <div className="animate-fadeIn">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Proposal Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(Object.keys(typeConfig) as ProposalType[]).map((t) => (
                            <button key={t} onClick={() => { setType(t); handleNext(); }}
                                className={`p-6 rounded-xl border transition text-left group relative overflow-hidden 
                                    ${type === t
                                        ? typeConfig[t].activeClasses
                                        : 'bg-white/5 border-white/10 hover:border-purple-500'
                                    }`}
                            >
                                <div className={`${typeConfig[t].textClass} mb-4`}>{typeConfig[t].icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{typeConfig[t].title}</h3>
                                <p className="text-sm text-gray-400">{typeConfig[t].desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: DETAILS (Same as before) */}
            {step === 2 && (
                <div className="animate-fadeIn space-y-6">
                    <h2 className="text-2xl font-bold text-white">Proposal Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Summary</label>
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full h-32 bg-black/50 border border-white/10 rounded p-3 text-white" />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-6" />

                    {/* ENTITY FIELDS */}
                    {type === 'ENTITY' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-blue-400">Execution Partner Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Entity Name</label>
                                    <input value={entityName} onChange={e => setEntityName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                                    <input value={entityAddress} onChange={e => setEntityAddress(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Jurisdiction <span className="text-red-500">*</span></label>
                                <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-purple-500">
                                    <option value="">Select Jurisdiction</option>
                                    {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* FUNDING FIELDS */}
                    {(type === 'FUNDING' || type === 'PROJECT_FUNDING') && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-green-400">Funding Request</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Total Ask (TRS)</label>
                                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Executor Wallet</label>
                                    <input value={executor} onChange={e => setExecutor(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Milestones</label>
                                {milestones.map((m, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <input value={m.desc} onChange={e => { const n = [...milestones]; n[i].desc = e.target.value; setMilestones(n) }} className="flex-grow bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Description" />
                                        <input type="number" value={m.amount} onChange={e => { const n = [...milestones]; n[i].amount = e.target.value; setMilestones(n) }} className="w-32 bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Amount" />
                                    </div>
                                ))}
                                <button onClick={() => setMilestones([...milestones, { desc: '', amount: '' }])} className="text-xs text-green-400 hover:text-green-300">+ Add Milestone</button>
                            </div>
                        </div>
                    )}

                    {/* OPPORTUNITY FIELDS */}
                    {type === 'OPPORTUNITY' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-purple-400">Market Intelligence</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Region</label>
                                    <input value={oppRegion} onChange={e => setOppRegion(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Contact (Email/Phone)</label>
                                    <input value={oppContact} onChange={e => setOppContact(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="email or +1234567890" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : 'Submit Proposal'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default function NewProposalPage() {
    return (
        <WalletGuard>
            <Suspense fallback={<div>Loading...</div>}>
                <NewProposalContent />
            </Suspense>
        </WalletGuard>
    );
}
