const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--- PHASE 4 (FIX) DEPLOYMENT START ---");
    console.log("Deploying with account:", deployer.address);

    // CORRECTED ADDRESSES FROM FRONTEND CONFIG (Step 2376)
    const TREASURY = "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E"; // Timelock
    const DIVIDEND_VAULT = "0x8EFccF257A361b16805FBb12aBB80E4AF06E7758";

    // Existing Registries
    const POLICY_REGISTRY = "0x77c33d2D974e34c60769446260FC939F9E367Df7";
    const REPUTATION_REGISTRY = "0x384f5651Ceae308676D1cc95a62886db30333DBa";

    // 1. Deploy RevenueRouter
    const RevenueRouter = await hre.ethers.getContractFactory("RevenueRouter");
    const router = await RevenueRouter.deploy(TREASURY, DIVIDEND_VAULT);
    await router.waitForDeployment();
    console.log("RevenueRouter deployed to:", router.target);

    // 2. Deploy ExecutionRegistry (V2)
    const ExecutionRegistry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = await ExecutionRegistry.deploy();
    await registry.waitForDeployment();
    console.log("ExecutionRegistry (V2) deployed to:", registry.target);

    // 3. Redeploy ProjectFactory (V3)
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy(
        registry.target,
        POLICY_REGISTRY,
        REPUTATION_REGISTRY
    );
    await factory.waitForDeployment();
    console.log("ProjectFactory (V3) deployed to:", factory.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
