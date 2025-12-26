import TRSTokenArtifact from '../app/abi/TRSToken.json';
import TRSSaleArtifact from '../app/abi/TRSSale.json';
import TRSGovernorArtifact from '../app/abi/TRSGovernor.json';
import DividendVaultArtifact from '../app/abi/DividendVault.json';
import ProjectRegistryArtifact from '../app/abi/ProjectRegistry.json';
import ProjectEscrowArtifact from '../app/abi/ProjectEscrow.json';
import CompanyRegistryArtifact from '../app/abi/CompanyRegistry.json'; // New
import JobRegistryArtifact from '../app/abi/JobRegistry.json'; // New
import ExecutionRegistryArtifact from '../app/abi/ExecutionRegistry.json';

export const CONTRACT_ADDRESSES = {
    TOKEN: "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0",
    SALE: "0x23A6c257Ee4cBf93727F3A2F6D26DeC58dC33aF9",
    GOVERNOR: "0x3Dc86Bf4B187e279D60a2bc08dcC74eB68d87eC6",
    TIMELOCK: "0x44e5e324B4BBe790F44891e53Eb32Cb362ab7714",

    // Core Registries
    COMPANY_REGISTRY: "0xD6861778e663a9769b017620Ec72e609936eE4E4",
    JOB_REGISTRY: "0x5f46a2Ae28EaCd273d84c789Bf25079c462e62f3",
    PROJECT_REGISTRY: "0x2a95edDB856D8A776e0598ff6a8775DA9A3A9051",
    EXECUTION_REGISTRY: "0x7C6B0b88C898EB79cb52b303ed508DF8018Ee278",
    KYC_REGISTRY: "0xf16806724E7C7166c32078C8d44782E67D9fe8F1",

    // Financial
    DIVIDEND_VAULT: "0x7D78b733b453EEb4d9Ec808Ae81d5d4949362039",
    FOUNDER_SPLITTER: "0x8FA2E6F76496c5A0708b84650BEb7886252cb063"
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
