const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";

    // Config
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying Execution Verification System with account:", deployer.address);

    // 1. Deploy ExecutionRegistry
    const ExecutionRegistry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const executionRegistry = await ExecutionRegistry.deploy();
    await executionRegistry.waitForDeployment();
    console.log("ExecutionRegistry deployed to:", executionRegistry.target);

    // 2. Deploy JobRegistry (Linked to Token & ExecutionRegistry)
    const JobRegistry = await hre.ethers.getContractFactory("JobRegistry");
    const jobRegistry = await JobRegistry.deploy(TOKEN_ADDRESS, executionRegistry.target);
    await jobRegistry.waitForDeployment();
    console.log("JobRegistry (v2) deployed to:", jobRegistry.target);

    console.log("\nUpdate lib/contracts.ts:");
    console.log(`    EXECUTION_REGISTRY: "${executionRegistry.target}",`);
    console.log(`    JOB_REGISTRY: "${jobRegistry.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
