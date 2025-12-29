const hre = require("hardhat");

async function main() {
    console.log("--- PHASE 2 DEPLOYMENT START ---");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy PolicyRegistry
    const PolicyRegistry = await hre.ethers.getContractFactory("PolicyRegistry");
    const policyRegistry = await PolicyRegistry.deploy();
    await policyRegistry.waitForDeployment();
    console.log("PolicyRegistry deployed to:", policyRegistry.target);

    // 2. Deploy ReputationRegistry
    const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    console.log("ReputationRegistry deployed to:", reputationRegistry.target);

    // 3. Redeploy ProjectFactory with Phase 2 Config
    // Needs ExecutionRegistry address from Phase 1 (or we can just reuse the one from deployed script logs if we had them dynamically)
    // Hardcoding existing Phase 1 Execution Registry for continuity:
    const EXECUTION_REGISTRY = "0xFD3791619881ec944Ab7080e84A9C818b2c59A1B";

    console.log("Deploying ProjectFactory V2...");
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const projectFactory = await ProjectFactory.deploy(
        EXECUTION_REGISTRY,
        policyRegistry.target,
        reputationRegistry.target
    );
    await projectFactory.waitForDeployment();
    console.log("ProjectFactory V2 deployed to:", projectFactory.target);

    // 4. Initial Setup
    // Set some initial policies test (50k limit is default)
    // Add Deployer as Authorized Reputation Updater for testing
    // Note: In prod, authorization would be transferred to Timelock

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log("Update frontend/lib/contracts.ts with:");
    console.log(`POLICY_REGISTRY: "${policyRegistry.target}",`);
    console.log(`REPUTATION_REGISTRY: "${reputationRegistry.target}",`);
    console.log(`PROJECT_FACTORY: "${projectFactory.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
