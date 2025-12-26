import { useState, useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { Vote, FileText, CheckCircle, XCircle, MinusCircle, Plus, ShieldCheck, Trash, AlertTriangle } from 'lucide-react';
import GovernorArtifact from '../abi/TRSGovernor.json';
import KYCArtifact from '../abi/KYCRegistry.json';
import TokenArtifact from '../abi/TRSToken.json';
import RegistryArtifact from '../abi/ProjectRegistry.json';

// Configuration
const PROJECT_REGISTRY_ADDRESS = "0xc6518b1C41a247e86f61BD5354dd62425C7806D2";

interface Proposal {
    id: string;
    proposer: string;
    description: string;
    state: number;
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
}

const ProposalState = [
    "Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"
];

const CATEGORIES = [
    "Ecovillage", "Water Infrastructure", "Food Processing", "Energy", "Education",
    "Legal", "DEX Infrastructure", "Audit", "Security", "Marketing",
    "Bio Agriculture", "Regenerative Farming"
];
const COUNTRIES = ["Global", "USA", "Germany", "Brazil", "India", "Nigeria", "Other"];

export default function Governance({ govAddress, kycAddress, tokenAddress, account, userTier }:
    { govAddress: string, kycAddress: string, tokenAddress: string, account: string, userTier: string }) {

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [govContract, setGovContract] = useState<Contract | null>(null);
    const [isKyced, setIsKyced] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [country, setCountry] = useState(COUNTRIES[0]);
    const [region, setRegion] = useState('');
    const [executor, setExecutor] = useState('');
    const [budget, setBudget] = useState('');
    const [milestones, setMilestones] = useState<{ amount: string, description: string }[]>([
        { amount: '', description: 'Initial Setup & Planning' }
    ]);

    useEffect(() => {
        if (account && window.ethereum) {
            setupContracts();
        }
    }, [account, govAddress]);

    async function setupContracts() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const gov = new ethers.Contract(govAddress, GovernorArtifact.abi, signer);
        const kyc = new ethers.Contract(kycAddress, KYCArtifact.abi, signer);

        setGovContract(gov);
        setExecutor(account); // Default execution to self

        try {
            const status = await kyc.isKyced(account);
            setIsKyced(status);
            fetchProposals(gov, provider);
        } catch (e) { console.error("Setup Error", e); }
    }

    async function fetchProposals(gov: Contract, provider: any) {
        try {
            const latestBlock = await provider.getBlockNumber();
            const filter = gov.filters.ProposalCreated();

            let events: any[] = [];
            // Strategy: Try 5000 -> 500 -> 100
            const ranges = [5000, 500, 100];

            for (const range of ranges) {
                try {
                    const start = latestBlock > range ? latestBlock - range : 0;
                    events = await gov.queryFilter(filter, start, "latest");
                    break;
                } catch (e: any) {
                    console.warn(`Fetch failed for range ${range}:`, e.code || e.message);
                    if (range === 100) events = [];
                }
            }

            const list: Proposal[] = [];

            // Process latest 10 proposals (reverse order)
            for (const event of events.reverse().slice(0, 10)) {
                const args = (event as any).args;
                const id = args[0];
                const proposer = args[1];
                const desc = args[8];

                // Fetch State & Votes
                const state = await gov.state(id);
                const votes = await gov.proposalVotes(id);

                list.push({
                    id: id.toString(),
                    proposer: proposer,
                    description: desc,
                    state: Number(state),
                    forVotes: ethers.formatEther(votes[1]),
                    againstVotes: ethers.formatEther(votes[0]),
                    abstainVotes: ethers.formatEther(votes[2]),
                });
            }
            setProposals(list);
        } catch (e) {
            console.error("Fetch Proposals Error", e);
        }
    }

    // Milestones Logic
    const addMilestone = () => setMilestones([...milestones, { amount: '', description: '' }]);
    const removeMilestone = (idx: number) => setMilestones(milestones.filter((_, i) => i !== idx));
    const updateMilestone = (idx: number, field: 'amount' | 'description', value: string) => {
        const newMs = [...milestones];
        newMs[idx][field] = value;
        setMilestones(newMs);
    };

    // Derived Legal Text
    const legalText = `
**LEGAL EXECUTION SCOPE**
This proposal authorizes the deployment of an immutable Project Execution Contract with the following binding parameters:
- **Project**: ${title} (${category})
- **Location**: ${region}, ${country}
- **Maximum Budget**: ${budget || 0} TRS
- **Authorized Executor**: ${executor}

**MILESTONE RELEASE SCHEDULE**
Funds are securely locked in escrow and released ONLY upon verification of the following milestones:
${milestones.map((m, i) => `${i + 1}. ${m.description}: ${m.amount || 0} TRS`).join('\n')}

**COMPLIANCE**
Any deviation from these parameters constitutes unauthorized use of DAO funds.
    `.trim();

    async function submitProposal() {
        if (!govContract || !title || !budget) return;
        setLoading(true);
        try {
            // 1. Prepare Arguments for createProject
            // ProjectRegistry.createProject(id, title, category, country, region, executor, token, budget, amounts, descs)
            const amountsWei = milestones.map(m => ethers.parseEther(m.amount || '0'));
            const descs = milestones.map(m => m.description);
            const budgetWei = ethers.parseEther(budget);

            // Verify budget matches sum of milestones?
            const totalMilestones = amountsWei.reduce((a, b) => a + b, BigInt(0));
            if (totalMilestones !== budgetWei) {
                if (!confirm(`Warning: Total Budget (${budget}) does not match sum of milestones (${ethers.formatEther(totalMilestones)}). Proceed?`)) {
                    setLoading(false); return;
                }
            }

            const registryInterface = new ethers.Interface(RegistryArtifact.abi);
            const projectId = "PROJ-" + Date.now().toString().slice(-6); // Simple ID generation

            const createProjectData = registryInterface.encodeFunctionData("createProject", [
                projectId,
                title,
                category,
                country,
                region,
                executor,
                tokenAddress, // Budget Token
                budgetWei,
                amountsWei,
                descs
            ]);

            // 2. Proposal Actions
            // Action 1: Timelock approves Registry to spend Budget
            const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, govContract.runner);
            const approveData = token.interface.encodeFunctionData("approve", [PROJECT_REGISTRY_ADDRESS, budgetWei]);

            // Action 2: Call createProject
            const targets = [tokenAddress, PROJECT_REGISTRY_ADDRESS];
            const values = [0, 0];
            const calldatas = [approveData, createProjectData];

            // 3. Submit to Governor
            const tx = await govContract.propose(targets, values, calldatas, legalText);
            await tx.wait();

            alert("Proposal Submitted Successfully!");
            setTitle(''); setBudget(''); setMilestones([{ amount: '', description: '' }]);
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    async function vote(id: string, support: number) {
        if (!govContract) return;
        setLoading(true);
        try {
            const tx = await govContract.castVote(id, support);
            await tx.wait();
            alert("Vote Cast!");
        } catch (e: any) {
            alert("Error: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    async function delegateToSelf() {
        if (!account || !tokenAddress || !govContract) return;
        setLoading(true);
        try {
            const token = new ethers.Contract(tokenAddress, TokenArtifact.abi, govContract.runner);
            const tx = await token.delegate(account);
            await tx.wait();
            alert("Delegation Successful!");
        } catch (e: any) {
            alert("Delegation Failed: " + (e.reason || e.message));
        }
        setLoading(false);
    }

    const canPropose = userTier === 'Founder' && isKyced;
    const canVote = (userTier === 'Founder' || userTier === 'Voter') && isKyced;

    return (
        <div id="governance" className="container mb-20">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Vote className="text-[#8b5cf6]" size={32} />
                    <h2 className="text-3xl mb-0">Governance Dashboard</h2>
                </div>
                <div className="flex gap-4">
                    <button onClick={delegateToSelf} disabled={loading} className="btn bg-white/10 hover:bg-white/20 text-sm py-1">
                        Activate Voting Power (Delegate)
                    </button>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded border ${isKyced ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
                        <ShieldCheck size={18} />
                        <span className="text-sm font-bold">{isKyced ? "KYC VERIFIED" : "KYC REQUIRED"}</span>
                    </div>
                </div>
            </div>

            {/* Structured Proposal Form */}
            {canPropose && (
                <div className="glass-card mb-8 p-6 bg-gradient-to-br from-purple-900/40 to-black/40 border border-purple-500/20">
                    <h3 className="text-xl mb-6 flex items-center gap-2 text-purple-300">
                        <FileText size={22} /> Create Structured Proposal
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Project Title" className="input-field"
                            value={title} onChange={e => setTitle(e.target.value)} />

                        <select className="input-field bg-black/50" value={category} onChange={e => setCategory(e.target.value)}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select className="input-field bg-black/50" value={country} onChange={e => setCountry(e.target.value)}>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input type="text" placeholder="Region / City" className="input-field"
                            value={region} onChange={e => setRegion(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <input type="number" placeholder="Total Budget (TRS)" className="input-field"
                            value={budget} onChange={e => setBudget(e.target.value)} />
                        <input type="text" placeholder="Executor Wallet Address" className="input-field font-mono text-xs"
                            value={executor} onChange={e => setExecutor(e.target.value)} />
                    </div>

                    <div className="mb-6">
                        <label className="text-sm text-gray-400 mb-2 block">Milestones (Budget Release Schedule)</label>
                        {milestones.map((m, idx) => (
                            <div key={idx} className="flex gap-2 mb-2">
                                <span className="p-2 py-3 text-gray-500 font-mono">#{idx + 1}</span>
                                <input type="text" placeholder="Milestone Description" className="input-field flex-grow mb-0"
                                    value={m.description} onChange={e => updateMilestone(idx, 'description', e.target.value)} />
                                <input type="number" placeholder="Amount (TRS)" className="input-field w-32 mb-0"
                                    value={m.amount} onChange={e => updateMilestone(idx, 'amount', e.target.value)} />
                                <button onClick={() => removeMilestone(idx)} className="p-2 text-red-400 hover:text-red-300">
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))}
                        <button onClick={addMilestone} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-2">
                            <Plus size={16} /> Add Milestone
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-black/40 rounded border border-white/10 font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {legalText}
                    </div>

                    <button onClick={submitProposal} disabled={loading} className="btn btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-purple-500/20">
                        {loading ? "Submitting..." : "Submit Proposal"}
                    </button>
                </div>
            )}

            {/* Proposals List */}
            <div className="grid gap-6">
                {proposals.length === 0 ? (
                    <p className="text-muted text-center italic">No active proposals found.</p>
                ) : proposals.map((p) => (
                    <div key={p.id} className="glass-card border border-white/5">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-bold text-white">Proposal #{p.id.substring(0, 6)}</h4>
                                <div className="text-sm text-gray-300 mb-2 mt-2 whitespace-pre-wrap font-sans bg-white/5 p-3 rounded">
                                    {p.description}
                                </div>
                                <p className="text-xs text-muted font-mono">Proposer: {p.proposer}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400`}>
                                {ProposalState[p.state]}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-6 text-center text-sm">
                            <div className="bg-white/5 rounded p-2">
                                <span className="block text-green-400 font-bold">{parseFloat(p.forVotes).toFixed(0)}</span>
                                <span className="text-muted text-xs">FOR</span>
                            </div>
                            <div className="bg-white/5 rounded p-2">
                                <span className="block text-red-400 font-bold">{parseFloat(p.againstVotes).toFixed(0)}</span>
                                <span className="text-muted text-xs">AGAINST</span>
                            </div>
                            <div className="bg-white/5 rounded p-2">
                                <span className="block text-gray-400 font-bold">{parseFloat(p.abstainVotes).toFixed(0)}</span>
                                <span className="text-muted text-xs">ABSTAIN</span>
                            </div>
                        </div>

                        {/* Actions */}
                        {canVote && p.state === 1 && (
                            <div className="flex gap-2">
                                <button onClick={() => vote(p.id, 1)} disabled={loading} className="btn flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 py-2">Vote For</button>
                                <button onClick={() => vote(p.id, 0)} disabled={loading} className="btn flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2">Vote Against</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
