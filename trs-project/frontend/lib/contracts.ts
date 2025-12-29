import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ProjectRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';
import CompanyRegistryArtifact from '../app/abi/CompanyRegistry.json'; // New
import JobRegistryArtifact from '../app/abi/JobRegistry.json'; // New
import ExecutionRegistryArtifact from '../app/abi/ExecutionRegistry.json';

// Deployed on BSC Testnet (Transparency Hooks Enabled)
export const CONTRACT_ADDRESSES = {
    // Core Governance
    TOKEN: "0xA0Ec16d810D69Fb68975a0b5aE4e7A88e3a0771E",
    TIMELOCK: "0x9D05b3711121B0F5cc2D053d584c0bEd52d56460",
    GOVERNOR: "0x036B3CfED7c37A10bAB1808cb9471a242549dd73",

    // Functional
    SALE: "0xf0AEBD2835f48c7b9cAB07ab5e83e9Bc1558F8A7",
    PROJECT_REGISTRY: "0x40c884d3072e3104E3bcb6382ed9aD90CB712AF4", // ExecutionRegistry

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x9dC4e6Ce87b9c5D8fCa9e13E36ABf3bFcFD35Af1",
    FOUNDER_SPLITTER: "0x2757EEe5B4e28d6CD8A74d7a32b58B12A6691F84",
    SEED_ESCROW: "0x55C4a6732f5f513752C49E5589f68FFc39424A4d",

    // Legacy / Placeholders
    USDT: "0x0000000000000000000000000000000000000000"
};

export const CONTRACT_ABIS = {
    TRSToken: TRSTokenArtifact.abi,
    TRSSale: TRSSaleArtifact.abi,
    TRSGovernor: TRSGovernorArtifact.abi,
    DividendVault: DividendVaultArtifact.abi,
    ProjectRegistry: ProjectRegistryArtifact.abi,
    ProjectEscrow: ProjectEscrowArtifact.abi,
    CompanyRegistry: CompanyRegistryArtifact.abi,
    JobRegistry: JobRegistryArtifact.abi,
    ExecutionRegistry: ExecutionRegistryArtifact.abi
};
