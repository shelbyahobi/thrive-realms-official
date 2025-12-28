'use client';

import { useState, useEffect, Suspense } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../../hooks/useWallet';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../../lib/contracts';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Plus, Trash, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle, ShieldCheck, Building2, Wallet } from 'lucide-react';

const CATEGORIES = [
    "Treasury Investment", "Execution Entity Approval", "Job / Contractor Engagement",
    "Physical Project Development", "Infrastructure / Protocol Upgrade", "Legal / Structural Action",
    "Strategic Partnership", "Governance Policy Update"
];
const COUNTRIES = ["Global", "USA", "Germany", "Brazil", "India", "Nigeria", "Other"];
const EXECUTION_MODELS = ["Approved Company", "Approved Individual", "Open Job Market", "Internal DAO Execution"];
const REPORTING_FREQUENCIES = ["Weekly", "Monthly", "Milestone-based"];

type ProposalType = 'project' | 'company_approval' | 'milestone' | 'treasury' | 'policy' | 'opportunity_registration';

function NewProposalContent() {
    const { provider, signer, account } = useWallet();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Context & Wizard State
    const [loading, setLoading] = useState(false);
    const [tier, setTier] = useState('');
    const [step, setStep] = useState(1);
    const [type, setType] = useState<ProposalType>('project'); // Default is "Investment Proposal"

    // --- SHARED DATA ---
    const [title, setTitle] = useState('');
    const [purpose, setPurpose] = useState(''); // Rationale / Abstract
    const [declaration, setDeclaration] = useState(false);

    // --- INVESTMENT / PROJECT DATA ---
    const [category, setCategory] = useState(CATEGORIES[3]);
    const [keyOutcomes, setKeyOutcomes] = useState('');
    const [problem, setProblem] = useState('');
    const [opportunity, setOpportunity] = useState('');
    const [solution, setSolution] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0]);

    const [executionModel, setExecutionModel] = useState(EXECUTION_MODELS[0]);
    const [executor, setExecutor] = useState('');
    const [executorName, setExecutorName] = useState('');
    const [verifiedCompanies, setVerifiedCompanies] = useState<{ address: string, name: string }[]>([]);

    const [budgetTotal, setBudgetTotal] = useState('');
    const [budgetBreakdown, setBudgetBreakdown] = useState<{ item: string, amount: string }[]>([{ item: 'Labor', amount: '' }]);
    const [milestones, setMilestones] = useState<{ amount: string, description: string, date: string }[]>([{ amount: '', description: 'Initial Setup', date: '' }]);

    const [risks, setRisks] = useState('');
    const [mitigation, setMitigation] = useState('');

    // --- OPPORTUNITY REGISTRATION DATA ---
    // (Uses Title, Opportunity, Market info, but NO Execution/Budget)
    const [marketSize, setMarketSize] = useState('');

    // --- POLICY DATA ---
    const [clause, setClause] = useState('');
    const [impactAnalysis, setImpactAnalysis] = useState('');

    // --- ENTITY / PARTNER DATA ---
    const [compName, setCompName] = useState('');
    const [companyAddr, setCompanyAddr] = useState('');
    const [compServices, setCompServices] = useState('');
    const [compWebsite, setCompWebsite] = useState('');
    const [compYears, setCompYears] = useState('');
    const [compTeamSize, setCompTeamSize] = useState('');

    // --- MILESTONE RELEASE DATA ---
    const [escrowAddr, setEscrowAddr] = useState('');
    const [milestoneIndex, setMilestoneIndex] = useState('');
    const [proofOfWork, setProofOfWork] = useState('');

    useEffect(() => {
        if (provider && account) {
            checkEligibility();
            fetchCompanies();
        }
    }, [provider, account]);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'milestone') {
            setType('milestone');
            setEscrowAddr(searchParams.get('escrow') || '');
            setMilestoneIndex(searchParams.get('index') || '');
            setTitle(`Release Milestone #${Number(searchParams.get('index')) + 1}`);
        } else if (typeParam === 'company_approval') {
            setType('company_approval');
            const addr = searchParams.get('address') || '';
            setCompanyAddr(addr);
            setTitle(`Approve Partner: ${addr.substring(0, 8)}...`);
        } else if (typeParam === 'opportunity') {
            setType('opportunity_registration');
            setTitle('New Opportunity Registration');
        } else {
            setType('project'); // Default "Investment Proposal"
        }
    }, [searchParams]);

    async function checkEligibility() {
        if (!provider || !account) return;
        const token = new ethers.Contract(CONTRACT_ADDRESSES.TOKEN, CONTRACT_ABIS.TRSToken, provider);
        const bal = await token.balanceOf(account);
        const balNum = parseFloat(ethers.formatEther(bal));
        if (balNum >= 24000) setTier('Founder');
        else setTier(balNum >= 12000 ? 'Voter' : 'Member');
    }

    async function fetchCompanies() {
        try {
            const registry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);
            const list = await registry.getVerifiedCompanies();
            const data = await Promise.all(list.map(async (addr: string) => {
                const c = await registry.getCompany(addr);
                return { address: addr, name: c.name };
            }));
            setVerifiedCompanies(data);
        } catch (err) { console.warn(err); }
    }

    // --- DYNAMIC STEPS LOGIC ---
    const getSteps = () => {
        if (type === 'policy') return [
            { id: 1, title: "Overview" },
            { id: 2, title: "Policy Details" },
            { id: 3, title: "Review" }
        ];
        if (type === 'milestone') return [
            { id: 1, title: "Overview" },
            { id: 2, title: "Proof of Work" },
            { id: 3, title: "Review" }
        ];
        if (type === 'opportunity_registration') return [
            { id: 1, title: "Overview" },
            { id: 2, title: "Market Data" },
            { id: 3, title: "Review" }
        ];
        // Default (Project / Company) - Full 5 Steps
        return [
            { id: 1, title: "Overview" },
            { id: 2, title: "Execution" },
            { id: 3, title: "Financials" },
            { id: 4, title: "Risks" },
            { id: 5, title: "Review" }
        ];
    };

    const steps = getSteps();
    const maxStep = steps.length;

    const nextStep = () => setStep(s => Math.min(s + 1, maxStep));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const addBudgetItem = () => setBudgetBreakdown([...budgetBreakdown, { item: '', amount: '' }]);
    const updateBudgetItem = (idx: number, field: keyof typeof budgetBreakdown[0], val: string) => {
        const n = [...budgetBreakdown]; n[idx][field] = val; setBudgetBreakdown(n);
    };
    const addMilestone = () => setMilestones([...milestones, { amount: '', description: '', date: '' }]);
    const updateMilestone = (idx: number, field: keyof typeof milestones[0], val: string) => {
        const n = [...milestones]; n[idx][field] = val; setMilestones(n);
    };

    const generateMarkdown = () => {
        const date = new Date().toISOString().split('T')[0];
        let content = `# ${title}\n\n`;
        content += `| | |\n| :--- | :--- |\n| **Type** | ${type.toUpperCase()} |\n| **Author** | ${account} |\n| **Date** | ${date} |\n\n`;

        if (type === 'policy') {
            content += `## 1. Abstract\n${purpose}\n\n## 2. Proposed Change\n### Clause\n${clause}\n\n### Rationale & Impact\n${impactAnalysis}`;
        } else if (type === 'opportunity_registration') {
            content += `## 1. Opportunity Overview\n${opportunity}\n\n## 2. Market Data\n- **Sector:** ${category}\n- **Market Size:** ${marketSize}\n- **Region:** ${country}\n\n## 3. Strategic Value\n${purpose}`;
        } else if (type === 'milestone') {
            content += `## 1. Release Request\nReleasing Milestone #${Number(milestoneIndex) + 1} for Contract \`${escrowAddr}\`.\n\n## 2. Proof of Work\n${proofOfWork}`;
        } else {
            // Full Investment Proposal
            content += `## 1. Executive Summary\n${purpose}\n\n## 2. Solution\n${solution}\n\n## 3. Financials\n**Total:** ${budgetTotal} TRS\n\n## 4. Execution\n**Executor:** ${executorName} (${executor})\n\n## 5. Risks\n${risks}`;
        }

        content += `\n\n## Declaration\n- [x] I confirm verify accuracy and abide by DAO rules.`;
        return content;
    };

    async function submitProposal() {
        if (!signer || !title) return;
        setLoading(true);
        try {
            // ... (Smart Contract Logic - Simplification: Reuse existing Gov propose for now)
            const description = generateMarkdown();
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);

            // Dummy Targets for non-executable proposals (Policy, Opp Reg)
            let targets = [CONTRACT_ADDRESSES.TOKEN];
            let values = [0];
            let calldatas = ["0x"];

            if (type === 'project') {
                // ... Project Creation Logic (Keep existing)
                const budgetWei = ethers.parseEther(budgetTotal || '0');
                const regInterface = new ethers.Interface(CONTRACT_ABIS.ProjectRegistry);
                const createData = regInterface.encodeFunctionData("createProject", [
                    "PROJ-" + Date.now(), title, category, country, region, executor, CONTRACT_ADDRESSES.TOKEN, budgetWei, [], []
                ]);
                targets = [CONTRACT_ADDRESSES.PROJECT_REGISTRY];
                calldatas = [createData];
            }

            const tx = await gov.propose(targets, values, calldatas, description);
            await tx.wait();
            router.push('/governance');
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    if (!account) return <div className="p-12 text-center text-gray-400">Please Connect Wallet</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">New Proposal</h1>
                    <p className="text-gray-400 text-sm">Create a new governance mandate</p>
                </div>
                <div className="flex bg-black/40 rounded-full p-1 border border-white/10 gap-1">
                    {[
                        { id: 'project', label: 'Investment' },
                        { id: 'opportunity_registration', label: 'Opportunity' },
                        { id: 'company_approval', label: 'Entity' },
                        { id: 'milestone', label: 'Milestone' },
                        { id: 'policy', label: 'Policy' }
                    ].map(t => (
                        <button key={t.id} onClick={() => { setType(t.id as any); setStep(1); }}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${type === t.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-8 px-4">
                {steps.map(s => (
                    <div key={s.id} className="flex flex-col items-center relative z-10 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition ${step >= s.id ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                            {step > s.id ? <CheckCircle size={16} /> : s.id}
                        </div>
                        <span className="text-xs uppercase font-bold text-gray-400">{s.title}</span>
                    </div>
                ))}
            </div>

            <div className="glass-card p-6 bg-black/40 border border-white/10 min-h-[400px] mb-8">
                {/* --- GENERIC STEP 1: OVERVIEW --- */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">1. Overview</h3>
                        <div>
                            <label className="label-text">Title</label>
                            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="Proposal Name" />
                        </div>
                        {type !== 'policy' && type !== 'milestone' && (
                            <div>
                                <label className="label-text">Category</label>
                                <select className="input-field bg-black" value={category} onChange={e => setCategory(e.target.value)}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="label-text">{type === 'policy' ? 'Abstract' : 'Purpose'}</label>
                            <textarea className="input-field h-32" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Short summary..." />
                        </div>
                    </div>
                )}

                {/* --- STEP 2: DYNAMIC CONTENT --- */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        {type === 'policy' && (
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">2. Policy Details</h3>
                                <div><label className="label-text">New Clause Text</label><textarea className="input-field h-40" value={clause} onChange={e => setClause(e.target.value)} /></div>
                                <div><label className="label-text">Impact Analysis</label><textarea className="input-field h-32" value={impactAnalysis} onChange={e => setImpactAnalysis(e.target.value)} /></div>
                            </>
                        )}
                        {type === 'opportunity_registration' && (
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">2. Market Intelligence</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label-text">Target Market Size</label><input className="input-field" value={marketSize} onChange={e => setMarketSize(e.target.value)} /></div>
                                    <div><label className="label-text">Country/Region</label><input className="input-field" value={country} onChange={e => setCountry(e.target.value)} /></div>
                                </div>
                                <div><label className="label-text">Detailed Opportunity Description</label><textarea className="input-field h-40" value={opportunity} onChange={e => setOpportunity(e.target.value)} /></div>
                                <div className="p-4 bg-yellow-900/10 border border-yellow-500/20 rounded text-sm text-yellow-200">
                                    ⚠️ <strong>Note:</strong> Registration does not request funds. It lists the opportunity in the Vault for due diligence.
                                </div>
                            </>
                        )}
                        {type === 'milestone' && (
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">2. Verification</h3>
                                <div><label className="label-text">Proof of Work (Links/Hash)</label><textarea className="input-field h-48 font-mono" value={proofOfWork} onChange={e => setProofOfWork(e.target.value)} /></div>
                            </>
                        )}
                        {(type === 'project' || type === 'company_approval') && (
                            /* Keep existing complex Execution Logic for full projects */
                            <>
                                <h3 className="text-xl font-bold text-white mb-4">2. Execution Plan</h3>
                                <div><label className="label-text">Solution Detail</label><textarea className="input-field h-40" value={solution} onChange={e => setSolution(e.target.value)} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="label-text">Executor Address</label><input className="input-field" value={executor} onChange={e => setExecutor(e.target.value)} /></div>
                                    <div><label className="label-text">Model</label><select className="input-field bg-black" value={executionModel} onChange={e => setExecutionModel(e.target.value)}>{EXECUTION_MODELS.map(m => <option key={m}>{m}</option>)}</select></div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* --- STEP 3/4/5: FINANCIALS (Only for Projects) --- */}
                {step === 3 && type === 'project' && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">3. Financials</h3>
                        <div><label className="label-text">Total Request (TRS)</label><input className="input-field text-xl text-green-400" value={budgetTotal} onChange={e => setBudgetTotal(e.target.value)} /></div>
                        {/* Breakdown UI... */}
                        {budgetBreakdown.map((b, i) => (
                            <div key={i} className="flex gap-2"><input className="input-field" value={b.amount} onChange={e => updateBudgetItem(i, 'amount', e.target.value)} placeholder="Amount" /></div>
                        ))}
                        <button onClick={addBudgetItem} className="text-sm text-purple-400">+ Add Line Item</button>
                    </div>
                )}

                {/* --- FINAL STEP: REVIEW --- */}
                {step === maxStep && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white mb-4">Final Review</h3>
                        <div className="p-4 bg-white/5 rounded border border-white/10 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {generateMarkdown()}
                        </div>
                        <label className="flex items-center gap-4 cursor-pointer p-4 bg-purple-900/10 border border-purple-500/30 rounded">
                            <input type="checkbox" className="w-5 h-5 accent-purple-500" checked={declaration} onChange={e => setDeclaration(e.target.checked)} />
                            <span className="text-white font-bold text-sm">I confirm this proposal complies with the Whitepaper's 6-Stage Lifecycle.</span>
                        </label>
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-0"><ChevronLeft size={16} /> Previous</button>
                {step === maxStep ? (
                    <button onClick={submitProposal} disabled={!declaration || loading} className="flex items-center gap-2 px-8 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold">{loading ? 'Processing...' : 'Submit Proposal'} <CheckCircle size={16} /></button>
                ) : (
                    <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold">Next <ChevronRight size={16} /></button>
                )}
            </div>
        </div>
    );
}

export default function NewProposalPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
            <NewProposalContent />
        </Suspense>
    );
}
