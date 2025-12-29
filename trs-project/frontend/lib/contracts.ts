import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ExecutionRegistry.json'; // Aliased for legacy compat, or use ExecutionRegistry export
import OpportunityRegistryArtifact from '../app/abi/OpportunityRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';

// Deployed on BSC Testnet (TRSSale Logic Fixed)
export const CONTRACT_ADDRESSES = {
    // Core Governance (Redeployed for 24h Voting)
    TOKEN: "0x2cEA540eDe529bf794C5555061CE963517d11DdA",
    TIMELOCK: "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E",
    GOVERNOR: "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B",

    // Functional
    SALE: "0x72F534A7dB15947F351eFc35b2D1e979D1156F81",
    PROJECT_REGISTRY: "0xFD3791619881ec944Ab7080e84A9C818b2c59A1B", // Execution Ledger
    OPPORTUNITY_REGISTRY: "0xfaA16C8Ea6f5177454Ed890403Fd55ef91274a6D", // Intelligence Vault

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x8EFccF257A361b16805FBb12aBB80E4AF06E7758",
    FOUNDER_SPLITTER: "0xF11eab17c1d84ef26b51005f2feba7Ccd03c9b6B",
    SEED_ESCROW: "0xF7E1b3B5Ee88475ef4b6b864279c72e031Caf221",

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
