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
    // Core Governance (Redeployed for 24h Voting - Testnet)
    TOKEN: "0xd1b6AA960A5862f1258210AB3688547Fc30E7C64",
    TIMELOCK: "0xBB8364a1328df8725DC32f586F8FF459988604B7",
    GOVERNOR: "0x62fD9ff006B7135Bf8020BAe148D04347a55E51b",
    GOVERNANCE_SETTINGS: "0x97bF8aEB32Bbf73C45a4Eb19D5Ce7d6d77FE5c7E", // Legacy/Mock

    // Functional
    SALE: "0xF16aC94f02E1E14AD07D8A4F17a35A7f96f72440",
    PROJECT_REGISTRY: "0x26f621A65d90aB3301f62757D41A85eFfD60fC47", // Alias
    EXECUTION_REGISTRY: "0x26f621A65d90aB3301f62757D41A85eFfD60fC47",
    OPPORTUNITY_REGISTRY: "0xe3005859f67d0313561759bc788828c90476bB09",
    PROJECT_FACTORY: "0x3882b1d212FD177aEf10138E6b22d2B50f83C68E",
    REPUTATION_REGISTRY: "0x276b5E845017658c5b59aD768392bb125ae75Eb8",
    POLICY_REGISTRY: "0x600a1B6381090c3EaEd5Bf9d93C6496e586F0177",
    REVENUE_ROUTER: "0x13b7dAaD6402A92D31fc31C9E1cC69beea114115", // Legacy

    // 5-Wallet Structure
    DIVIDEND_VAULT: "0xc027308535eEcA9CAc850E2C060aF27C868b6F9E",
    FOUNDER_SPLITTER: "0xAFED250360A895e9463fFd1B067FFdA0345D6dd8",
    SEED_ESCROW: "0x68c8708B9b0dB5AA3Acd5839a18052851Dac0ab7",

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
