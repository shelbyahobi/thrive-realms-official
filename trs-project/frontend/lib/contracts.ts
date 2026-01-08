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
    // Core Governance (Testnet Mode: 100 TRS Threshold, 0 Quorum)
    TOKEN: "0x65a94C08f4c00B00F1F544D046e9997C7DA2c398",
    TIMELOCK: "0xC841B3A82F9258e7873ab09a77d8aD737D6bE1F2",
    GOVERNOR: "0x2A5d04d73f2313cf3f96c4a3FF7F37a51B845E27",
    GOVERNANCE_SETTINGS: "0x97bF8aEB32Bbf73C45a4Eb19D5Ce7d6d77FE5c7E", // Legacy

    // Functional
    SALE: "0x54D1E886E17CbDA997d2ad382ABF6d870B997F48",
    PROJECT_REGISTRY: "0xD86fbe75a334C27C13b839B8bC81AEECe1596D1D", // Alias
    EXECUTION_REGISTRY: "0xD86fbe75a334C27C13b839B8bC81AEECe1596D1D",
    OPPORTUNITY_REGISTRY: "0x30eD10C69f38Be9AFb1b1FA3C3Ea8563E2d7cE34",
    PROJECT_FACTORY: "0x92f97B5269290Bb101Cb79451f939B07Cfea721F",
    REPUTATION_REGISTRY: "0x0Ec54E5aa4ED5f3a0b81dB90Bf42c0CFc72Be894",
    POLICY_REGISTRY: "0xCaaDB27c99348068A0Eb0B8bD33332932949F839",
    REVENUE_ROUTER: "0x13b7dAaD6402A92D31fc31C9E1cC69beea114115", // Legacy

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0x39a1ACd46C047A5d4686d9ecB7FD21b95DD32847",
    FOUNDER_SPLITTER: "0x1b490e889B50d9c6302E2d6b4F90f2b2686e9118",
    SEED_ESCROW: "0xb84c95daB45EA341A88EB6Fc77205c1f13037404",

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
