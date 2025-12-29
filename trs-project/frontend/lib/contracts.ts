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
    TOKEN: "0x82dBdE45Bfdb0e842417770851893a0429715783",
    TIMELOCK: "0xc653198033621453258593450e13719fE485295c",
    GOVERNOR: "0x334bC48D53c22F2633000dF45f80145c893a74B3",

    // Functional
    SALE: "0x166E4a2EABD603A11e39dF9E7bCde7870a3f4506",
    PROJECT_REGISTRY: "0xC83141f1B5a5937402F0B9356B2d33967d1C2506", // ExecutionRegistry

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x3b6Df71569424C5354f969019623c56ee5e5F2A2",
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
