import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ExecutionRegistry.json'; // Aliased for legacy compat, or use ExecutionRegistry export
import OpportunityRegistryArtifact from '../app/abi/OpportunityRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';

// Deployed on BSC Testnet (TRSSale Logic Fixed)
export const CONTRACT_ADDRESSES = {
    // Core Governance
    TOKEN: "0x9C9618d2859a868b43C8500557d5B05a5A83f114",
    TIMELOCK: "0x49F17Af4817e28f1fae76E6df022f3755309ae0B",
    GOVERNOR: "0x93D84DD8222E891eB1FDaBE8D01F03a873d6c5A1",

    // Functional
    SALE: "0x589473c644655321eD1F7825f47BEbed82Df5103",
    PROJECT_REGISTRY: "0x55fd96Fe808FBeaAeb5E388cD66d9A686f264036", // ExecutionRegistry
    VAULT: "0xD61552b05c611ba4e5aFDBBb34C8BA6BE58Eb829",       // OpportunityRegistry (Intelligence Vault)

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x15fb393f46E9c3425b13e1A7c63f4a0f84305809",
    FOUNDER_SPLITTER: "0x52B68Ba69ef3711ea8536DD557a546B86E6BE792",
    SEED_ESCROW: "0xfA65E33D7535b7fF5dE668B8d8C9E088Ed1151d9",

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
