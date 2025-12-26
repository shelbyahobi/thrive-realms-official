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
    TOKEN: "0xFacFF7e3Cdb548f5935e4ad65C7d668241EB7000",
    SALE: "0x92830c9166688C64E074ac2AC2c54c5F839e9073",
    GOVERNOR: "0x502Ef2D5f06985E9ba93D2d9D6CDCafDE9C19024",
    TIMELOCK: "0xD44534BE13e76d6b6A0eD49E9684545ddE6a7526",

    // Core Registries
    COMPANY_REGISTRY: "0xFcA76AE893C5ed5dcD5050b773f8C27d790B1396",
    JOB_REGISTRY: "0x7e4E4A154b8E2F2B1568D3e2b610e74aE37007cE",
    PROJECT_REGISTRY: "0x20639c8C21683fF29dAa5AfcBFF359D1332163D7",
    EXECUTION_REGISTRY: "0x41D1E2F96719cc015023B7649C172b985bfbE593",
    KYC_REGISTRY: "0xe1dfb4165278a13C66c7297980a55eF054BDb581",

    // Financial
    DIVIDEND_VAULT: "0xDc1656d517fb2262827c6D018F6598aAB37d6c13",
    FOUNDER_SPLITTER: "0x574dca4791e4ad90109e49b1511B5147a5D034F0"
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
