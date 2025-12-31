import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ExecutionRegistryArtifact from '../app/abi/ExecutionRegistry.json';
import OpportunityRegistryArtifact from "../app/abi/OpportunityRegistry.json";
import ProjectFactoryArtifact from "../app/abi/ProjectFactory.json";
import ProjectEscrowArtifact from "../app/abi/ProjectEscrow.json";
import PolicyRegistryArtifact from "../app/abi/PolicyRegistry.json";
import ReputationRegistryArtifact from "../app/abi/ReputationRegistry.json";
import RevenueRouterArtifact from "../app/abi/RevenueRouter.json";
import GovernanceSettingsArtifact from "../app/abi/GovernanceSettings.json";

// Deployed on BSC Testnet (TRSSale Logic Fixed)
export const CONTRACT_ADDRESSES = {
    // Core Governance (Redeployed for 24h Voting)
    TOKEN: "0x2cEA540eDe529bf794C5555061CE963517d11DdA",
    TIMELOCK: "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E",
    GOVERNOR: "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B",
    GOVERNANCE_SETTINGS: "0x97bF8aEB32Bbf73C45a4Eb19D5Ce7d6d77FE5c7E", // MVP Governance State (Phase 2)

    // Functional
    SALE: "0x72F534A7dB15947F351eFc35b2D1e979D1156F81",
    PROJECT_REGISTRY: "0x8ffc8c871053B6B430255a4011f14748f05854dC", // Alias
    EXECUTION_REGISTRY: "0x8ffc8c871053B6B430255a4011f14748f05854dC", // Phase 3 Upgraded
    OPPORTUNITY_REGISTRY: "0xfaA16C8Ea6f5177454Ed890403Fd55ef91274a6D",
    PROJECT_FACTORY: "0xFad7cAe30410eaE2F847098352b822E511e78F9b", // Phase 3 Upgraded
    POLICY_REGISTRY: "0x94CFb7115857245b7803a0E8246e72F5015b601B",
    REPUTATION_REGISTRY: "0x40D4e2a47290530A2c6386BD1b2F2b4A2472F940",
    REVENUE_ROUTER: "0x13b7dAaD6402A92D31fc31C9E1cC69beea114115", // Phase 3 Upgraded

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
    ExecutionRegistry: ExecutionRegistryArtifact.abi, // Using Fresh ExecutionRegistry ABI
    OpportunityRegistry: OpportunityRegistryArtifact.abi,
    ProjectFactory: ProjectFactoryArtifact.abi,
    ProjectEscrow: ProjectEscrowArtifact.abi,
    PolicyRegistry: PolicyRegistryArtifact.abi,
    ReputationRegistry: ReputationRegistryArtifact.abi,
    RevenueRouter: RevenueRouterArtifact.abi,
    GovernanceSettings: GovernanceSettingsArtifact.abi,

};
