const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--- PHASE 4 DEPLOYMENT START ---");
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy Legacy/Existing Addresses (Read from previous context or hardcode if needed)
    // We need Treasury and DividendVault for RevenueRouter
    // Treasury = Timelock
    // DividendVault = Active Vault
    const TREASURY = "0xaa87829286d9972379737E174E181057e9301980"; // Timelock (BSC Testnet)
    const DIVIDEND_VAULT = "0xAFc3066E0F81155989F971271110090886cED573"; // DividendVault (BSC Testnet)
    const POLICY_REGISTRY = "0x77c33d2D974e34c60769446260FC939F9E367Df7";
    const REPUTATION_REGISTRY = "0x384f5651Ceae308676D1cc95a62886db30333DBa";

    // 2. Deploy RevenueRouter
    const RevenueRouter = await hre.ethers.getContractFactory("RevenueRouter");
    const router = await RevenueRouter.deploy(TREASURY, DIVIDEND_VAULT);
    await router.waitForDeployment();
    console.log("RevenueRouter deployed to:", router.target);

    // 3. Deploy ExecutionRegistry (V2)
    // We are replacing the old one. This means ProjectFactory needs update too.
    const ExecutionRegistry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = await ExecutionRegistry.deploy();
    await registry.waitForDeployment();
    console.log("ExecutionRegistry (V2) deployed to:", registry.target);

    // 4. Redeploy ProjectFactory (V3)
    // Needs (ExecutionRegistry, PolicyRegistry, ReputationRegistry)
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy(
        registry.target,
        POLICY_REGISTRY,
        REPUTATION_REGISTRY
    );
    await factory.waitForDeployment();
    console.log("ProjectFactory (V3) deployed to:", factory.target);

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log("Update frontend/lib/contracts.ts with:");
    console.log(`REVENUE_ROUTER: "${router.target}",`);
    console.log(`EXECUTION_REGISTRY: "${registry.target}",`);
    console.log(`PROJECT_FACTORY: "${factory.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
