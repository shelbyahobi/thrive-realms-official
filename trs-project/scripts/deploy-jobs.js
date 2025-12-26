const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3"; // From contracts.ts
    const DEPLOYER_ADDRESS = (await hre.ethers.getSigners())[0].address;

    console.log("Deploying Job System Contracts with account:", DEPLOYER_ADDRESS);

    // 1. Deploy CompanyRegistry
    const CompanyRegistry = await hre.ethers.getContractFactory("CompanyRegistry");
    const companyRegistry = await CompanyRegistry.deploy();
    await companyRegistry.waitForDeployment();
    console.log("CompanyRegistry deployed to:", companyRegistry.target);

    // 2. Deploy JobRegistry
    const JobRegistry = await hre.ethers.getContractFactory("JobRegistry");
    const jobRegistry = await JobRegistry.deploy(TOKEN_ADDRESS); // Pass Token for Tier checks
    await jobRegistry.waitForDeployment();
    console.log("JobRegistry deployed to:", jobRegistry.target);

    // 3. Output for Copy-Paste
    const content = `
    COMPANY_REGISTRY: "${companyRegistry.target}",
    JOB_REGISTRY: "${jobRegistry.target}",
    `;
    console.log("\nAdd this to lib/contracts.ts:");
    console.log(content);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
