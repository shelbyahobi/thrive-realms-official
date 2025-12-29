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
    TOKEN: "0xDd719fDe6f093b58242fa58E1207B57A3FEd714D",
    TIMELOCK: "0xeccf3fCbA5e11b7AaaC0340317c95305695dc02d",
    GOVERNOR: "0x99f7533591657be105636C82CdD8249549381d5D",

    // Functional
    SALE: "0xBd0D77CD1A020a105bD9F0d12d44da229f09000B",
    PROJECT_REGISTRY: "0x1b2e349A06191CF3c0dA1850B94C78894E27d705", // ExecutionRegistry

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x4643724F003b0B9aFE5E9e056A345968842EC81A",
    FOUNDER_SPLITTER: "0xf15B9072447B7882af99eE618ca554A605B45f54",
    SEED_ESCROW: "0x89C735f6A8D195AA3293AA37aA2B6667a17c78Be",

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
