import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ProjectRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';
import CompanyRegistryArtifact from '../app/abi/CompanyRegistry.json'; // New
import JobRegistryArtifact from '../app/abi/JobRegistry.json'; // New
import ExecutionRegistryArtifact from '../app/abi/ExecutionRegistry.json';

// Deployed on BSC Testnet (Re-deployed with Funded Sale)
export const CONTRACT_ADDRESSES = {
    // Core Governance
    TOKEN: "0xaFC99bE7996Ae21217b45dcE7111DC0AE526B741",
    TIMELOCK: "0x04F243007CdC3f9311A295963b77b9a7bEC3abb6",
    GOVERNOR: "0xdd0A98b7AB8D8bcaE2EA26E033F872474d844bbf",

    // Functional
    SALE: "0xE07ef8D01b4064ceceC4e3987047D147f0560F8F",
    PROJECT_REGISTRY: "0xF97724F4709EA4c481A82FF9A4040B5d56C601b2", // ExecutionRegistry

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x2365831F8e99feD822Bb5335f0d05aC571558a95",
    FOUNDER_SPLITTER: "0x50C27c7D16A8B3240c290A7e82503Da802D1aCcD",
    SEED_ESCROW: "0x8Bd01300C2e22F2A2513c565f5f289Ec239be6c1",

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
