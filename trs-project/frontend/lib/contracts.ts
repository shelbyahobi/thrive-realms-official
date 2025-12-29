import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ProjectRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';
import CompanyRegistryArtifact from '../app/abi/CompanyRegistry.json'; // New
import JobRegistryArtifact from '../app/abi/JobRegistry.json'; // New
import ExecutionRegistryArtifact from '../app/abi/ExecutionRegistry.json';

// Deployed on BSC Testnet
export const CONTRACT_ADDRESSES = {
    // Core Governance
    TOKEN: "0x82dbDE45BfDB0E842417770851893A0429715783",
    TIMELOCK: "0xC653198033621453258593450e13719FE485295c",
    GOVERNOR: "0x334BC48d53C22F2633000df45F80145C893a74b3",

    // Functional
    SALE: "0x166e4a2eABd603a11E39df9E7bCDe7870a3F4506",
    PROJECT_REGISTRY: "0xc83141F1b5a5937402F0B9356b2D33967d1C2506", // ExecutionRegistry

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x3B6dF71569424c5354F969019623C56Ee5e5F2a2",
    FOUNDER_SPLITTER: "0xD2ddeC1B591A8A95AB6eAcB4b00cC2969d893129",
    SEED_ESCROW: "0x08C2B52De52daD945F102c7A40f02B840237664C",

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
