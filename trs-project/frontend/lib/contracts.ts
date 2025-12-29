import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ExecutionRegistry.json'; // Aliased for legacy compat, or use ExecutionRegistry export
import OpportunityRegistryArtifact from '../app/abi/OpportunityRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';

// Deployed on BSC Testnet (Transparency Hooks Enabled)
export const CONTRACT_ADDRESSES = {
    // Core Governance
    TOKEN: "0xF4B88C28852D7332AdF4939C1082e027cFA1CF29",
    TIMELOCK: "0x78A7ad1625F565A33d9e58bB63bF19769E7591c3",
    GOVERNOR: "0xA4aDb8bF661806d00Ad5F23662f86D7796f325BD",

    // Functional
    SALE: "0x2452065278a34Dc98F64Cd459F680B6C1458DD27",
    PROJECT_REGISTRY: "0x7cC186dd99F2021C69C8EF390dFAFa7aD4c4e999", // ExecutionRegistry
    VAULT: "0x1dE8CFf01bacAFF8145c2E1907A4239224E4E493",       // OpportunityRegistry (Intelligence Vault)

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x886bE8509894e2563a7463eFCb4766a516cb7d2B",
    FOUNDER_SPLITTER: "0x6BEda4683e206e1b62958ed1Ffab663B374bAb5C",
    SEED_ESCROW: "0xb1C65Ef73145CE592B117F25872e9798E4Ec8014",

    // Legacy / Placeholders
    USDT: "0x0000000000000000000000000000000000000000"
};

export const CONTRACT_ABIS = {
    TRSToken: TRSTokenArtifact.abi,
    TRSSale: TRSSaleArtifact.abi,
    TRSGovernor: TRSGovernorArtifact.abi,
    DividendVault: DividendVaultArtifact.abi,
    ExecutionRegistry: ProjectRegistryArtifact.abi, // Using ExecutionRegistry ABI
    OpportunityRegistry: OpportunityRegistryArtifact.abi,
    ProjectEscrow: ProjectEscrowArtifact.abi
};
