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
    const [bridgeLicense, setBridgeLicense] = useState('');

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
    const [expenseBreakdown, setExpenseBreakdown] = useState<{ category: string, desc: string, amount: string }[]>([{ category: 'Filing', desc: '', amount: '' }]);

    // LEGAL & POD ENHANCED STATE
    const [legalName, setLegalName] = useState('');
    const [legalGov, setLegalGov] = useState('Token Voting');
    const [legalOpAgreement, setLegalOpAgreement] = useState('');
    const [podName, setPodName] = useState('');
    const [podAdmin, setPodAdmin] = useState('');
    const [podThreshold, setPodThreshold] = useState('3/5 Multisig');
    const [podMandate, setPodMandate] = useState('Geographic (Regional)');
    const [podCap, setPodCap] = useState('');

    // TEMPLATE SPECIFIC STATE
    // Agri
    const [agriCountry, setAgriCountry] = useState('');
    const [agriDuration, setAgriDuration] = useState('');
    const [agriFundingModel, setAgriFundingModel] = useState('Loan');

    // SME
    const [smeName, setSmeName] = useState('');
    const [smeLegalStatus, setSmeLegalStatus] = useState('Registered');
    const [smeFundingModel, setSmeFundingModel] = useState('Loan');
    const [smeEquity, setSmeEquity] = useState('');
    const [smeRepayment, setSmeRepayment] = useState('');

    // Research
    const [resInst, setResInst] = useState('');
    const [resArea, setResArea] = useState('');
    const [resIp, setResIp] = useState('Open Source');

    // Infrastructure
    const [infraType, setInfraType] = useState('Physical');
    const [infraMaint, setInfraMaint] = useState('');

    const template = searchParams.get('template');

    const typeConfig: Record<ProposalType, { title: string, desc: string, icon: any, activeClasses: string, textClass: string }> = {
        'ENTITY': {
            title: 'Execution Partner',
            desc: 'Register as a verified partner to execute projects.',
            icon: <Briefcase size={32} />,
            activeClasses: 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500',
            textClass: 'text-blue-400'
        },
        'FUNDING': {
            title: 'Funding Request',
            desc: 'Request Treasury funds for a specific project or initiative.',
            icon: <DollarSign size={32} />,
            activeClasses: 'bg-green-900/40 border-green-500 ring-1 ring-green-500',
            textClass: 'text-green-400'
        },
        'OPPORTUNITY': {
            title: 'Market Intelligence',
            desc: 'Submit valuable market data or opportunities (No immediate funding).',
            icon: <Globe size={32} />,
            activeClasses: 'bg-purple-900/40 border-purple-500 ring-1 ring-purple-500',
            textClass: 'text-purple-400'
        },
        'FAST_TRACK': {
            title: 'Fast Track (Tier 3)',
            desc: 'Expedited funding for high-reputation partners (Automated).',
            icon: <ShieldCheck size={32} />,
            activeClasses: 'bg-orange-900/40 border-orange-500 ring-1 ring-orange-500',
            textClass: 'text-orange-400'
        },
        'FIAT_BRIDGE': {
            title: 'Fiat Gateway',
            desc: 'Register as a licensed Fiat-to-Crypto bridge provider.',
            icon: <Banknote size={32} />,
            activeClasses: 'bg-emerald-900/40 border-emerald-500 ring-1 ring-emerald-500',
            textClass: 'text-emerald-400'
        },
        'EXECUTION_POD': {
            title: 'Execution Pod',
            desc: 'Spin up a semi-autonomous sub-DAO with its own treasury.',
            icon: <Users size={32} />,
            activeClasses: 'bg-pink-900/40 border-pink-500 ring-1 ring-pink-500',
            textClass: 'text-pink-400'
        },
        'LEGAL_STRUCTURE': {
            title: 'Legal Entity',
            desc: 'Propose a new legal wrapper for the DAO.',
            icon: <Scale size={32} />,
            activeClasses: 'bg-yellow-900/40 border-yellow-500 ring-1 ring-yellow-500',
            textClass: 'text-yellow-400'
        },
        'LEGAL_SETUP_FUNDING': {
            title: 'Legal Setup Funding',
            desc: 'Request funds specifically for legal formation costs.',
            icon: <Scale size={32} />,
            activeClasses: 'bg-cyan-900/40 border-cyan-500 ring-1 ring-cyan-500',
            textClass: 'text-cyan-400'
        },
        'PROJECT_FUNDING': {
            title: 'Project Funding',
            desc: 'Standard project funding request.',
            icon: <DollarSign size={32} />,
            activeClasses: 'bg-green-900/40 border-green-500 ring-1 ring-green-500',
            textClass: 'text-green-400'
        }
    };

    const generateMarkdown = () => {
        const date = new Date().toISOString().split('T')[0];
        let md = `# ${title}\n\n| Metadata | |\n| :--- | :--- |\n| **Type** | ${type} |\n| **Template** | ${template || 'Standard'} |\n| **Author** | ${account} |\n| **Date** | ${date} |\n\n## Executive Summary\n${summary}\n\n`;

        if (type === 'ENTITY' || type === 'FIAT_BRIDGE') {
            md += `## Entity Details\n- **Name:** ${entityName}\n- **Wallet:** \`${entityAddress}\`\n- **Jurisdiction:** ${jurisdiction}\n`;
            if (type === 'FIAT_BRIDGE') md += `- **License:** ${bridgeLicense}\n`;
        }
        else if (['FUNDING', 'PROJECT_FUNDING', 'FAST_TRACK'].includes(type)) {
            md += `## Funding Request\n- **Total Budget:** ${budget} TRS\n- **Executor:** \`${executor}\`\n`;

            // Template Specifics
            if (template === 'AGRI') {
                md += `\n### Regenerative Agri Framework\n- **Country:** ${agriCountry}\n- **Duration:** ${agriDuration} months\n- **Model:** ${agriFundingModel}\n`;
            } else if (template === 'SME') {
                md += `\n### SME Growth Framework\n- **Company:** ${smeName}\n- **Status:** ${smeLegalStatus}\n- **Model:** ${smeFundingModel}\n- **Equity/Repayment:** ${smeFundingModel === 'Equity' ? smeEquity + '%' : smeRepayment}\n`;
            } else if (template === 'RESEARCH') {
                md += `\n### Research Grant\n- **Institution:** ${resInst}\n- **Area:** ${resArea}\n- **IP Policy:** ${resIp}\n`;
            } else if (template === 'INFRA') {
                md += `\n### Infrastructure Project\n- **Type:** ${infraType}\n- **Maintenance:** ${infraMaint}\n`;
            }

            md += `\n## Milestones\n`;
            milestones.forEach((m) => md += `1. **${m.desc}**: ${m.amount} TRS\n`);
        }
        else if (type === 'OPPORTUNITY') {
            md += `## Market Intelligence\n- **Market Size:** ${oppMarket}\n- **Region:** ${oppRegion}\n- **Contact:** ${oppContact}\n`;
        }
        else if (type === 'LEGAL_STRUCTURE') {
            md += `## Legal Entity Definition\n- **Proposed Name:** ${legalName}\n- **Form:** ${legalType}\n- **Jurisdiction:** ${legalJurisdiction}\n- **Governance:** ${legalGov}\n- **Op. Agreement Hash:** \`${legalOpAgreement || 'N/A'}\`\n- **Facilitator:** ${legalFacilitator}\n- **Setup Cap:** ${legalBudget} TRS\n`;
        }
        else if (type === 'LEGAL_SETUP_FUNDING') {
            md += `## Legal Setup Costs\n`;
            expenseBreakdown.forEach(e => md += `- **${e.category}**: ${e.desc} (${e.amount} TRS)\n`);
        }
        else if (type === 'EXECUTION_POD') {
            md += `## Execution Pod Config\n- **Pod Name:** ${podName}\n- **Mandate:** ${podMandate}\n- **Treasury Cap:** ${podCap} TRS\n- **Initial Admin:** \`${podAdmin}\`\n- **Voting Model:** ${podThreshold}\n`;
        }

        md += `\n\n---\n**Declaration**: Confirmed via Thrive Realms Protocol.`;
        return md;
    };

    const handleNext = () => setStep(s => s + 1);

    const handleSubmit = async () => {
        if (!signer) return;

        // Validation
        if (!title) { alert("Title is required"); return; }
        if (!summary) { alert("Summary is required"); return; }

        if (type === 'ENTITY') {
            if (!entityName) { alert("Entity Name is required"); return; }
            if (!entityAddress) { alert("Entity Address is required"); return; }
            if (!jurisdiction) { alert("Jurisdiction is required"); return; }
        }

        if (['FUNDING', 'PROJECT_FUNDING'].includes(type)) {
            if (!budget) { alert("Budget is required"); return; }
            if (!executor) { alert("Executor Address is required"); return; }
        }

        setLoading(true);
        try {
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const description = generateMarkdown();
            let targets: string[] = [], values: number[] = [], calldatas: string[] = [];

            // GENERIC PROPOSAL LOGIC (For enhanced types, we rely on the Markdown Description as the Spec)
            // Ideally we would have specific contracts for PodRegistry etc.
            // For now, we use a NULL call to the Governance Settings or similar to record it on-chain.

            if (type === 'ENTITY') {
                const regInterface = new ethers.Interface(CONTRACT_ABIS.ExecutionRegistry);
                const data = regInterface.encodeFunctionData("registerEntity", [entityAddress, 1, entityName, jurisdiction, entityUrl]);
                targets = [CONTRACT_ADDRESSES.EXECUTION_REGISTRY];
                values = [0];
                calldatas = [data];
            } else if (['FUNDING', 'PROJECT_FUNDING', 'FAST_TRACK'].includes(type) && milestones.length > 0) {
                // ... (Existing Milestone Logic) ...
                let totalBudget = BigInt(0);
                const milestoneAmounts: BigInt[] = [];
                const milestoneDescs: string[] = [];
                milestones.forEach(m => {
                    const amtWei = ethers.parseEther(m.amount || '0');
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
            } else {
                // For Legal/Pod types without a specific contract call yet:
                // We make a dummy call to GovernanceSettings to log the proposal
                targets = [CONTRACT_ADDRESSES.GOVERNANCE_SETTINGS];
                values = [0];
                calldatas = ["0x"]; // Empty call
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
                        {(Object.keys(typeConfig) as ProposalType[])
                            .filter(t => {
                                const p = searchParams.get('pillar');
                                if (p === 'EXECUTION') return ['ENTITY', 'FIAT_BRIDGE', 'EXECUTION_POD'].includes(t);
                                if (p === 'CAPITAL') return ['FUNDING', 'PROJECT_FUNDING', 'FAST_TRACK', 'OPPORTUNITY'].includes(t);
                                if (p === 'LAW') return ['LEGAL_STRUCTURE', 'LEGAL_SETUP_FUNDING'].includes(t);
                                return true; // Show all if no pillar
                            })
                            .map((t) => (
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

            {/* STEP 2: DETAILS */}
            {step === 2 && (
                <div className="animate-fadeIn space-y-6">
                    <h2 className="text-2xl font-bold text-white">Proposal Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title <span className="text-red-500">*</span></label>
                            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Summary <span className="text-red-500">*</span></label>
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} className="w-full h-32 bg-black/50 border border-white/10 rounded p-3 text-white" />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-6" />

                    {/* ENTITY FIELDS */}
                    {(type === 'ENTITY' || type === 'FIAT_BRIDGE') && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-blue-400">
                                {type === 'FIAT_BRIDGE' ? 'Fiat Gateway Details' : 'Execution Partner Info'}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Entity Name <span className="text-red-500">*</span></label>
                                    <input value={entityName} onChange={e => setEntityName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Wallet Address <span className="text-red-500">*</span></label>
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
                            {type === 'FIAT_BRIDGE' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">License Number (VASP/MSB)</label>
                                    <input value={bridgeLicense} onChange={e => setBridgeLicense(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="Registration Number" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* FUNDING FIELDS (Standard, Fast Track, Project) */}
                    {(type === 'FUNDING' || type === 'PROJECT_FUNDING' || type === 'FAST_TRACK') && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-green-400">
                                {searchParams.get('template') ? `${searchParams.get('template')} Framework` : (type === 'FAST_TRACK' ? 'Fast Track Funding' : 'Funding Request')}
                            </h3>

                            {/* --- TEMPLATE SPECIFIC FIELDS --- */}

                            {/* AGRI TEMPLATE */}
                            {searchParams.get('template') === 'AGRI' && (
                                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded grid grid-cols-2 gap-4">
                                    <div className="col-span-2 text-sm text-green-200 mb-2 font-bold flex items-center gap-2"><Globe size={16} /> Regenerative Agriculture Specs</div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Country</label>
                                        <input value={agriCountry} onChange={e => setAgriCountry(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="e.g. Kenya" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Project Duration (Months)</label>
                                        <input type="number" value={agriDuration} onChange={e => setAgriDuration(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Funding Model</label>
                                        <select value={agriFundingModel} onChange={e => setAgriFundingModel(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                            <option>Loan</option>
                                            <option>Revenue Share</option>
                                            <option>Hybrid</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* SME TEMPLATE */}
                            {searchParams.get('template') === 'SME' && (
                                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded grid grid-cols-2 gap-4">
                                    <div className="col-span-2 text-sm text-blue-200 mb-2 font-bold flex items-center gap-2"><Briefcase size={16} /> SME Growth Specs</div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Company Name</label>
                                        <input value={smeName} onChange={e => setSmeName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Legal Status</label>
                                        <select value={smeLegalStatus} onChange={e => setSmeLegalStatus(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                            <option>Registered Entity</option>
                                            <option>Unregistered / Informal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Funding Model</label>
                                        <select value={smeFundingModel} onChange={e => setSmeFundingModel(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                            <option>Loan</option>
                                            <option>Equity</option>
                                        </select>
                                    </div>
                                    {smeFundingModel === 'Equity' ? (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Equity Offered (%)</label>
                                            <input type="number" value={smeEquity} onChange={e => setSmeEquity(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Repayment Terms</label>
                                            <input value={smeRepayment} onChange={e => setSmeRepayment(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="e.g. 5% Interest, 12mo" />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* RESEARCH TEMPLATE */}
                            {searchParams.get('template') === 'RESEARCH' && (
                                <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded grid grid-cols-2 gap-4">
                                    <div className="col-span-2 text-sm text-purple-200 mb-2 font-bold flex items-center gap-2"><Building2 size={16} /> Research Grant Specs</div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Institution Name</label>
                                        <input value={resInst} onChange={e => setResInst(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Research Area</label>
                                        <input value={resArea} onChange={e => setResArea(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1">IP Policy</label>
                                        <select value={resIp} onChange={e => setResIp(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                            <option>Open Source (CC-BY)</option>
                                            <option>DAO Owned IP</option>
                                            <option>Shared / Hybrid</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* INFRA TEMPLATE */}
                            {searchParams.get('template') === 'INFRA' && (
                                <div className="p-4 bg-orange-900/20 border border-orange-500/30 rounded grid grid-cols-2 gap-4">
                                    <div className="col-span-2 text-sm text-orange-200 mb-2 font-bold flex items-center gap-2"><Users size={16} /> Infrastructure Specs</div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Asset Type</label>
                                        <select value={infraType} onChange={e => setInfraType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                            <option>Physical (Grid/Roads)</option>
                                            <option>Digital (Servers/Code)</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm text-gray-400 mb-1">Maintenance Plan</label>
                                        <textarea value={infraMaint} onChange={e => setInfraMaint(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white h-20" placeholder="Who maintains this asset?" />
                                    </div>
                                </div>
                            )}

                            {/* STANDARD FIELDS */}
                            {type === 'FAST_TRACK' && (
                                <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded flex items-center gap-3">
                                    <ShieldCheck className="text-orange-500" />
                                    <div className="text-sm">
                                        <div className="text-orange-200 font-bold">Reputation Score: {reputation}</div>
                                        <div className="text-gray-400">Requires 80+ for Fast Track processing.</div>
                                    </div>
                                </div>
                            )}
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

                    {/* LEGAL STRUCTURE FIELDS */}
                    {type === 'LEGAL_STRUCTURE' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-yellow-400">Legal Entity Definition</h3>
                            <div className="p-4 bg-yellow-900/10 border border-yellow-500/30 rounded mb-4 text-sm text-yellow-200">
                                This proposal establishes a legally binding entity for the DAO. All details will be hashed and recorded on-chain.
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Proposed Entity Name</label>
                                    <input value={legalName} onChange={e => setLegalName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="e.g. Thrive Realms LLC" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Jurisdiction</label>
                                    <select value={legalJurisdiction} onChange={e => setLegalJurisdiction(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                        <option value="Wyoming (DAO-LLC)">Wyoming (DAO-LLC)</option>
                                        <option value="Switzerland">Switzerland</option>
                                        <option value="Cayman Islands">Cayman Islands</option>
                                        <option value="Marshall Islands">Marshall Islands</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Legal Form</label>
                                    <select value={legalType} onChange={e => setLegalType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                        <option>DAO-Controlled LLC</option>
                                        <option>Swiss Association</option>
                                        <option>UNA (Unincorporated Nonprofit)</option>
                                        <option>Cayman Foundation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Governance Model</label>
                                    <select value={legalGov} onChange={e => setLegalGov(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                        <option>Token Voting (Optimistic)</option>
                                        <option>Multisig Veto</option>
                                        <option>Trustee Managed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Operating Agreement (IPFS Hash)</label>
                                    <input value={legalOpAgreement} onChange={e => setLegalOpAgreement(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" placeholder="Qm..." />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Setup Budget Cap (TRS)</label>
                                    <input type="number" value={legalBudget} onChange={e => setLegalBudget(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LEGAL SETUP FUNDING FIELDS */}
                    {type === 'LEGAL_SETUP_FUNDING' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-emerald-400">Legal Setup Funding</h3>
                            <div className="p-4 bg-emerald-900/20 border border-emerald-500/50 rounded mb-4">
                                <div className="text-sm font-bold text-emerald-200">Active Mandate: {activeLegalStructure?.type ? "Defined" : "None"}</div>
                                <div className="text-xs text-gray-400">Est. Budget: {activeLegalStructure?.budget || 0} TRS | Jurisdiction: {activeLegalStructure?.jurisdiction || "N/A"}</div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Expense Breakdown</label>
                                {expenseBreakdown.map((item, i) => (
                                    <div key={i} className="flex gap-2 mb-2">
                                        <span className="p-2 bg-white/5 rounded text-gray-400 w-24 text-xs flex items-center">{item.category}</span>
                                        <input value={item.desc} onChange={e => { const n = [...expenseBreakdown]; n[i].desc = e.target.value; setExpenseBreakdown(n) }} className="flex-grow bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Description" />
                                        <input type="number" value={item.amount} onChange={e => { const n = [...expenseBreakdown]; n[i].amount = e.target.value; setExpenseBreakdown(n) }} className="w-24 bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="TRS" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* EXECUTION POD FIELDS */}
                    {type === 'EXECUTION_POD' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-pink-400">Execution Pod Configuration</h3>
                            <div className="p-4 bg-pink-900/10 border border-pink-500/30 rounded mb-4 text-sm text-pink-200">
                                Spin up a new sub-DAO (Pod) with specific mandate, budget, and voting rules.
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Pod Name</label>
                                    <input value={podName} onChange={e => setPodName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" placeholder="e.g. Agri-Finance Pod" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Initial Admin Wallet</label>
                                    <input value={podAdmin} onChange={e => setPodAdmin(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Pod Mandate Type</label>
                                    <select value={podMandate} onChange={e => setPodMandate(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                        <option>Geographic (Regional)</option>
                                        <option>Sector Specific (e.g. Ag)</option>
                                        <option>Investment Committee</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Voting Model</label>
                                    <select value={podThreshold} onChange={e => setPodThreshold(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white">
                                        <option>3/5 Multisig</option>
                                        <option>Simple Majority (Token)</option>
                                        <option>Single Admin (Limited)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pod Treasury Cap (TRS)</label>
                                <input type="number" value={podCap} onChange={e => setPodCap(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-3 text-white" />
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
