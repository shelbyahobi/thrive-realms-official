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

type ProposalType = 'project' | 'company_approval' | 'milestone' | 'treasury' | 'policy';

function NewProposalContent() {
    const { provider, signer, account } = useWallet();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Context & Wizard State
    const [loading, setLoading] = useState(false);
    const [tier, setTier] = useState('');
    const [step, setStep] = useState(1);
    const [type, setType] = useState<ProposalType>('project');

    // --- 14-POINT DATA STRUCTURE ---

    // 1. Executive Summary
    const [title, setTitle] = useState('');
    const [purpose, setPurpose] = useState('');
    const [keyOutcomes, setKeyOutcomes] = useState('');

    // 2. Category & Scope
    const [category, setCategory] = useState(CATEGORIES[3]);
    const [scopeType, setScopeType] = useState('Milestone-based');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState(COUNTRIES[0]);

    // 3. Problem & Opportunity
    const [problem, setProblem] = useState('');
    const [opportunity, setOpportunity] = useState('');

    // 4. Proposed Solution
    const [solution, setSolution] = useState('');
    const [executionModel, setExecutionModel] = useState(EXECUTION_MODELS[0]);

    // 5. Execution Entity
    const [executor, setExecutor] = useState(''); // Wallet Address
    const [executorName, setExecutorName] = useState('');
    const [companyAddr, setCompanyAddr] = useState(''); // For Approval Type
    const [verifiedCompanies, setVerifiedCompanies] = useState<{ address: string, name: string }[]>([]);

    // 6. Budget
    const [budgetTotal, setBudgetTotal] = useState('');
    const [budgetBreakdown, setBudgetBreakdown] = useState<{ item: string, amount: string }[]>([
        { item: 'Labor', amount: '' }, { item: 'Infrastructure', amount: '' }
    ]);

    // 7. Milestones
    const [milestones, setMilestones] = useState<{ amount: string, description: string, date: string }[]>([
        { amount: '', description: 'Initial Setup', date: '' }
    ]);

    // 8. Risk Assessment
    const [risks, setRisks] = useState('');
    const [mitigation, setMitigation] = useState('');

    // 9. Legal 
    const [jurisdiction, setJurisdiction] = useState('Global (DAO)');

    // 10. Reporting
    const [reportingFreq, setReportingFreq] = useState(REPORTING_FREQUENCIES[1]);

    // 11. KPIs
    const [kpis, setKpis] = useState('');

    // 12. Exit Strategy
    const [exitStrategy, setExitStrategy] = useState('');

    // 13. Rationale
    const [rationale, setRationale] = useState('');

    // 14. Declaration
    const [declaration, setDeclaration] = useState(false);

    // Milestone Release Only
    const [escrowAddr, setEscrowAddr] = useState('');
    const [milestoneIndex, setMilestoneIndex] = useState('');
    const [milestoneAmount, setMilestoneAmount] = useState('');

    useEffect(() => {
        if (provider) {
            if (account) checkEligibility();
            fetchCompanies();
        }
    }, [provider, account]);

    useEffect(() => {
        const typeParam = searchParams.get('type');
        if (typeParam === 'milestone') {
            setType('milestone');
            setEscrowAddr(searchParams.get('escrow') || '');
            setMilestoneIndex(searchParams.get('index') || '');
            setMilestoneAmount(searchParams.get('amount') || '');
            setTitle(`Release Milestone #${Number(searchParams.get('index')) + 1}`);
        } else if (typeParam === 'company_approval') {
            setType('company_approval');
            const addr = searchParams.get('address') || '';
            setCompanyAddr(addr);
            setTitle(`Approve Execution Partner: ${addr.substring(0, 8)}...`);
            setCategory("Execution Entity Approval");

            // Auto-Fetch Company Data
            if (addr && provider) {
                const reg = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);
                reg.getCompany(addr).then((c: any) => {
                    setCompName(c.name);
                    try {
                        const meta = JSON.parse(c.metadataURI);
                        setCompWebsite(meta.website || '');
                        setCompServices(meta.description || '');
                        setPurpose(`Approval for ${c.name} to become an official Execution Partner.`);
                    } catch (e) {
                        // Fallback for old format
                        setPurpose("Approval for registered entity.");
                    }
                });
            }
        } else if (typeParam === 'project') {
            setType('project');
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
            const companyRegistry = new ethers.Contract(CONTRACT_ADDRESSES.COMPANY_REGISTRY, CONTRACT_ABIS.CompanyRegistry, provider);
            const list = await companyRegistry.getVerifiedCompanies();
            const data = await Promise.all(list.map(async (addr: string) => {
                const c = await companyRegistry.getCompany(addr);
                return { address: addr, name: c.name };
            }));
            setVerifiedCompanies(data);
            if (data.length > 0) {
                setExecutor(data[0].address);
                setExecutorName(data[0].name);
            }
        } catch (err) { console.warn(err); }
    }

    // --- COMPANY PROPOSAL DATA ---
    const [compName, setCompName] = useState('');
    const [compType, setCompType] = useState('SME');
    const [compWebsite, setCompWebsite] = useState('');
    const [compYears, setCompYears] = useState('');
    const [compServices, setCompServices] = useState('');
    const [compTeamSize, setCompTeamSize] = useState('');
    const [compTrsCommit, setCompTrsCommit] = useState('Member');
    const [compStatusReq, setCompStatusReq] = useState('Execution Partner');

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
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

        if (type === 'company_approval') {
            return `
# ${title}

| | |
| :--- | :--- |
| **Type** | DAO PARTNER ONBOARDING |
| **Submitted By** | ${account} |
| **Date** | ${date} |
| **Entity** | ${compName} |
| **Wallet** | \`${companyAddr}\` |

## 1. Company Overview
- **Legal Name:** ${compName}
- **Type:** ${compType}
- **Website:** ${compWebsite}
- **Years Operation:** ${compYears}
- **Location:** ${country}

## 2. Capabilities & Services
**Core Services:**
${compServices}

**Team Size:** ${compTeamSize} Employees

## 3. DAO Commitment
- **Target Tier:** ${compTrsCommit}
- **Requested Status:** ${compStatusReq}
- **Execution Wallet:** \`${companyAddr}\`

## 4. Rationale for Joining
${purpose}

## 5. Risk & Accountability
**Risks:**
${risks}

**Mitigation:**
${mitigation}

## 6. Declaration
- [x] Confirmed accurate and subject to DAO rules.
- [x] We agree to on-chain transparency and reputation slashing.
            `.trim();
        }

        return `
# ${title}

|  |  |
| :--- | :--- |
| **Type** | ${type.toUpperCase()} |
| **Submitted By** | ${account} |
| **Date** | ${date} |

## 1. Executive Summary
**Purpose:** ${purpose}
**Key Outcomes:** ${keyOutcomes}

## 2. Scope
- **Category:** ${category}
- **Type:** ${scopeType}
- **Location:** ${region}, ${country}

## 3. Problem & Opportunity
**Problem:** ${problem}
**Opportunity:** ${opportunity}

## 4. Solution
**Approach:** ${solution}
**Model:** ${executionModel}

## 5. Execution Entity
- **Name:** ${executorName || 'N/A'}
- **Address:** ${executor || companyAddr || 'N/A'}

## 6. Financials
**Total:** ${budgetTotal} TRS
${budgetBreakdown.map(b => `- ${b.item}: ${b.amount}`).join('\n')}

## 7. Milestones
${milestones.map((m, i) => `- M${i + 1}: ${m.amount} TRS (${m.date}) - ${m.description}`).join('\n')}

## 8. Risks
**Risks:** ${risks}
**Mitigation:** ${mitigation}

## 9-13. Strategy & Compliance
- **Jurisdiction:** ${jurisdiction}
- **Reporting:** ${reportingFreq}
- **KPIs:** ${kpis}
- **Exit:** ${exitStrategy}
- **Rationale:** ${rationale}

## 14. Declaration
- [x] Confirmed accurate and subject to DAO rules.
`.trim();
    };

    async function submitProposal() {
        if (!signer || !title) return;
        setLoading(true);
        try {
            let targets: string[] = [];
            let values: number[] = [];
            let calldatas: string[] = [];

            if (type === 'project') {
                if (!budgetTotal) throw new Error("Budget Required");
                if (!executor) throw new Error("Executor Address Required");

                const amountsWei = milestones.map(m => ethers.parseEther(m.amount || '0'));
                const descs = milestones.map(m => m.description);
                const budgetWei = ethers.parseEther(budgetTotal);

                const regInterface = new ethers.Interface(CONTRACT_ABIS.ProjectRegistry);
                const projectId = "PROJ-" + Date.now().toString().slice(-6);
                const createData = regInterface.encodeFunctionData("createProject", [
                    projectId, title, category, country, region, executor, CONTRACT_ADDRESSES.TOKEN, budgetWei, amountsWei, descs
                ]);

                const tokInterface = new ethers.Interface(CONTRACT_ABIS.TRSToken);
                const approveData = tokInterface.encodeFunctionData("approve", [CONTRACT_ADDRESSES.PROJECT_REGISTRY, budgetWei]);

                targets = [CONTRACT_ADDRESSES.TOKEN, CONTRACT_ADDRESSES.PROJECT_REGISTRY];
                values = [0, 0];
                calldatas = [approveData, createData];

            } else if (type === 'company_approval') {
                const compInterface = new ethers.Interface(CONTRACT_ABIS.CompanyRegistry);
                const approveData = compInterface.encodeFunctionData("approveCompany", [companyAddr]);
                targets = [CONTRACT_ADDRESSES.COMPANY_REGISTRY];
                values = [0];
                calldatas = [approveData];
            } else if (type === 'milestone') {
                const escInterface = new ethers.Interface(CONTRACT_ABIS.ProjectEscrow);
                const releaseData = escInterface.encodeFunctionData("releaseMilestone", [milestoneIndex]);
                targets = [escrowAddr];
                values = [0];
                calldatas = [releaseData];
            }

            const description = generateMarkdown();
            const gov = new ethers.Contract(CONTRACT_ADDRESSES.GOVERNOR, CONTRACT_ABIS.TRSGovernor, signer);
            const tx = await gov.propose(targets, values, calldatas, description);
            await tx.wait();

            alert("Submit Success!");
            router.push('/governance');
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    if (!account) return <div className="p-12 text-center text-gray-400">Please Connect Wallet</div>;

    const steps = [
        { id: 1, title: "Overview" },
        { id: 2, title: "Execution" },
        { id: 3, title: "Financials" },
        { id: 4, title: "Risks" },
        { id: 5, title: "Review" }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">New Proposal</h1>
                    <p className="text-gray-400 text-sm">Universal Founder Template (14-Point)</p>
                </div>
                {/* Type Pucks */}
                <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                    {['project', 'company_approval', 'milestone', 'policy'].map(t => (
                        <button key={t} onClick={() => setType(t as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition ${type === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                            {t === 'project' ? 'Project' : t === 'company_approval' ? 'Entity' : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between mb-8 px-4">
                {steps.map(s => (
                    <div key={s.id} className="flex flex-col items-center relative z-10 w-full">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-colors duration-300
                            ${step >= s.id ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
                            {step > s.id ? <CheckCircle size={16} /> : s.id}
                        </div>
                        <span className={`text-xs uppercase tracking-wider font-bold ${step >= s.id ? 'text-purple-300' : 'text-gray-600'}`}>
                            {s.title}
                        </span>
                        {/* Connecting Line */}
                        {s.id !== 5 && (
                            <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 ${step > s.id ? 'bg-purple-500/50' : 'bg-white/5'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className={`glass-card p-6 bg-black/40 border border-white/10 min-h-[400px] mb-8 transition-all duration-300`}>

                {/* STEP 1: OVERVIEW */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">
                            {type === 'company_approval' ? '1. Company Overview' : '1. Executive Summary & Scope'}
                        </h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="label-text">Proposal Title</label>
                                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder={type === 'company_approval' ? "Approval: [Company Name]" : "Official Proposal Name"} />
                            </div>

                            {type === 'company_approval' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Legal Name</label>
                                            <input className="input-field" value={compName} onChange={e => setCompName(e.target.value)} placeholder="Official Trading Name" />
                                        </div>
                                        <div>
                                            <label className="label-text">Company Type</label>
                                            <select className="input-field bg-black" value={compType} onChange={e => setCompType(e.target.value)}>
                                                <option>SME</option><option>Startup</option><option>Cooperative</option><option>Contractor</option><option>Enterprise</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Website / Portfolio</label>
                                            <input className="input-field" value={compWebsite} onChange={e => setCompWebsite(e.target.value)} placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="label-text">Years Operation</label>
                                            <input className="input-field" type="number" value={compYears} onChange={e => setCompYears(e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Location (Country)</label>
                                        <select className="input-field bg-black" value={country} onChange={e => setCountry(e.target.value)}>
                                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-text">Reason for Joining DAO</label>
                                        <textarea className="input-field h-24" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Why do you want to be a partner?" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Category</label>
                                            <select className="input-field bg-black" value={category} onChange={e => setCategory(e.target.value)}>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Scope</label>
                                            <select className="input-field bg-black" value={scopeType} onChange={e => setScopeType(e.target.value)}>
                                                <option>One-time</option><option>Milestone-based</option><option>Ongoing</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label-text">Purpose</label>
                                        <textarea className="input-field h-20" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Why does this matter?" />
                                    </div>
                                    <div>
                                        <label className="label-text">Key Outcomes</label>
                                        <textarea className="input-field h-20" value={keyOutcomes} onChange={e => setKeyOutcomes(e.target.value)} placeholder="Who benefits?" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Problem</label>
                                            <textarea className="input-field h-24" value={problem} onChange={e => setProblem(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label-text">Opportunity</label>
                                            <textarea className="input-field h-24" value={opportunity} onChange={e => setOpportunity(e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: EXECUTION / CAPABILITIES */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">
                            {type === 'company_approval' ? '2. Capabilities & Status' : '2. Solution & Execution'}
                        </h3>
                        <div className="space-y-4">
                            {type === 'company_approval' ? (
                                <>
                                    <div>
                                        <label className="label-text">Core Services & Experience</label>
                                        <textarea className="input-field h-32" value={compServices} onChange={e => setCompServices(e.target.value)} placeholder="List your services, past projects, and expertise..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Team Size</label>
                                            <input type="number" className="input-field" value={compTeamSize} onChange={e => setCompTeamSize(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="label-text">Target Tier</label>
                                            <select className="input-field bg-black" value={compTrsCommit} onChange={e => setCompTrsCommit(e.target.value)}>
                                                <option>Member</option><option>Voter</option><option>Founder</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Requested Status</label>
                                            <select className="input-field bg-black" value={compStatusReq} onChange={e => setCompStatusReq(e.target.value)}>
                                                <option>Execution Partner</option><option>Service Provider</option><option>Strategic Partner</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Execution Wallet Address</label>
                                            <input className="input-field font-mono border-indigo-500/50" value={companyAddr} onChange={e => setCompanyAddr(e.target.value)} placeholder="0x... (Will be Whitelisted)" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="label-text">Proposed Solution</label>
                                        <textarea className="input-field h-32" value={solution} onChange={e => setSolution(e.target.value)} placeholder="Technical approach..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label-text">Model</label>
                                            <select className="input-field bg-black" value={executionModel} onChange={e => {
                                                setExecutionModel(e.target.value);
                                                if (e.target.value === "Internal DAO Execution") {
                                                    setExecutor(CONTRACT_ADDRESSES.TIMELOCK);
                                                    setExecutorName("DAO Treasury (Internal)");
                                                } else if (e.target.value === "Approved Company" && verifiedCompanies.length > 0) {
                                                    setExecutor(verifiedCompanies[0].address);
                                                    setExecutorName(verifiedCompanies[0].name);
                                                } else {
                                                    setExecutor('');
                                                    setExecutorName('');
                                                }
                                            }}>
                                                {EXECUTION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label-text">Executor Address</label>
                                            {executionModel === "Approved Company" && verifiedCompanies.length > 0 ? (
                                                <select className="input-field bg-black" value={executor} onChange={e => {
                                                    const c = verifiedCompanies.find(v => v.address === e.target.value);
                                                    setExecutor(c?.address || ''); setExecutorName(c?.name || '');
                                                }}>
                                                    {verifiedCompanies.map(c => <option key={c.address} value={c.address}>{c.name}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    className="input-field font-mono"
                                                    value={executor}
                                                    onChange={e => {
                                                        setExecutor(e.target.value);
                                                        setExecutorName("Custom / Individual");
                                                    }}
                                                    placeholder={executionModel === "Internal DAO Execution" ? "DAO Address" : "0x..."}
                                                    disabled={executionModel === "Internal DAO Execution"}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: FINANCIALS */}
                {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">3. Budget & Milestones</h3>
                        {type === 'project' ? (
                            <>
                                <div>
                                    <label className="label-text">Total Budget (TRS)</label>
                                    <input type="number" className="input-field text-xl font-bold text-green-400" value={budgetTotal} onChange={e => setBudgetTotal(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="label-text block mb-2 font-bold opacity-80">Budget Breakdown</label>
                                        {budgetBreakdown.map((b, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <input className="input-field mb-0" placeholder="Item" value={b.item} onChange={e => updateBudgetItem(i, 'item', e.target.value)} />
                                                <input className="input-field mb-0 w-24" placeholder="TRS" value={b.amount} onChange={e => updateBudgetItem(i, 'amount', e.target.value)} />
                                            </div>
                                        ))}
                                        <button onClick={addBudgetItem} className="text-sm text-purple-400">+ Add Item</button>
                                    </div>
                                    <div>
                                        <label className="label-text block mb-2 font-bold opacity-80">Milestones</label>
                                        {milestones.map((m, i) => (
                                            <div key={i} className="flex gap-2 mb-2">
                                                <div className="w-8 pt-3 text-xs text-gray-500">M{i + 1}</div>
                                                <input className="input-field mb-0" placeholder="Desc" value={m.description} onChange={e => updateMilestone(i, 'description', e.target.value)} />
                                                <input className="input-field mb-0 w-24" placeholder="TRS" value={m.amount} onChange={e => updateMilestone(i, 'amount', e.target.value)} />
                                            </div>
                                        ))}
                                        <button onClick={addMilestone} className="text-sm text-purple-400">+ Add Milestone</button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 bg-white/5 rounded text-center text-gray-400">Not applicable for this proposal type.</div>
                        )}
                    </div>
                )}

                {/* STEP 4: RISKS */}
                {step === 4 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">4. Risk & Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="label-text">Risks</label>
                                <textarea className="input-field h-32" value={risks} onChange={e => setRisks(e.target.value)} />
                            </div>
                            <div>
                                <label className="label-text">Mitigation</label>
                                <textarea className="input-field h-32" value={mitigation} onChange={e => setMitigation(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="label-text">Jurisdiction / Legal</label>
                            <input className="input-field" value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* STEP 5: REVIEW */}
                {step === 5 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">5. Final Review</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="label-text">KPIs</label>
                                <textarea className="input-field h-24" value={kpis} onChange={e => setKpis(e.target.value)} />
                            </div>
                            <div>
                                <label className="label-text">Exit Strategy</label>
                                <textarea className="input-field h-24" value={exitStrategy} onChange={e => setExitStrategy(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="label-text">Rationale</label>
                            <textarea className="input-field h-16" value={rationale} onChange={e => setRationale(e.target.value)} />
                        </div>

                        <div className="p-6 bg-purple-900/10 border border-purple-500/30 rounded-lg mt-4">
                            <label className="flex items-center gap-4 cursor-pointer">
                                <input type="checkbox" className="w-6 h-6 accent-purple-500" checked={declaration} onChange={e => setDeclaration(e.target.checked)} />
                                <span className="text-white font-bold">
                                    I confirm that all information provided is accurate to the best of my knowledge.
                                    I acknowledge that funds are governed by DAO rules and subject to transparency and audit.
                                </span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center">
                <button onClick={prevStep} disabled={step === 1} className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold ${step === 1 ? 'opacity-0' : 'bg-white/5 hover:bg-white/10 text-white'}`}>
                    <ChevronLeft size={20} /> Previous
                </button>

                {step === 5 ? (
                    <button onClick={submitProposal} disabled={!declaration || loading} className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-lg transition-all ${!declaration ? 'bg-gray-700 text-gray-500' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'}`}>
                        {loading ? 'Processing...' : 'Submit Proposal'} <CheckCircle size={20} />
                    </button>
                ) : (
                    <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white transition-all">
                        Next Step <ChevronRight size={20} />
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
