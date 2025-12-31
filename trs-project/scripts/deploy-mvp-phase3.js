const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--- MVP PHASE 3 DEPLOYMENT ---");
    console.log("Deploying with accounting:", deployer.address);

    // CONSTANTS (BSC Testnet existing addresses)
    // Using lowercase to avoid checksum errors
    const TREASURY = "0x95ff3eb798e2970e471c888fb095c496d67d7a5e"; // Timelock
    const DIVIDEND_VAULT = "0x8efccf257a361b16805fbb12abb80e4af06e7758";
    const POLICY_REGISTRY = "0x94cfb7115857245b7803a0e8246e72f5015b601b";
    const REPUTATION_REGISTRY = "0x40d4e2a47290530a2c6386bd1b2f2b4a2472f940";

    // 1. Deploy upgraded ExecutionRegistry (Phase 3 logic)
    const ExecutionRegistry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = await ExecutionRegistry.deploy();
    await registry.waitForDeployment();
    console.log("ExecutionRegistry deployed to:", registry.target);

    // 2. Deploy upgraded RevenueRouter (4-way split)
    // Needs 2 new wallets for Execution Rewards and Risk Reserve. 
    // For MVP/Testnet, we can use the deployer or generate new ones.
    // Let's use the deployer as placeholder for now, or the Timelock.
    // Actually, let's use the Timelock for ALL reserved buckets to keep it simple and safe.
    const EXECUTION_REWARDS = TREASURY;
    const RISK_RESERVE = TREASURY;

    const RevenueRouter = await hre.ethers.getContractFactory("RevenueRouter");
    const router = await RevenueRouter.deploy(TREASURY, DIVIDEND_VAULT, EXECUTION_REWARDS, RISK_RESERVE);
    await router.waitForDeployment();
    console.log("RevenueRouter deployed to:", router.target);

    // 3. Deploy upgraded ProjectFactory (Linked to new Registry)
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy(
        registry.target,
        POLICY_REGISTRY,
        REPUTATION_REGISTRY
    );
    await factory.waitForDeployment();
    console.log("ProjectFactory deployed to:", factory.target);

    // Transfer ownership of Registry to Timelock (Important!)
    await registry.transferOwnership(TREASURY);
    console.log("ExecutionRegistry ownership transferred to Timelock");

    // Transfer ownership of Router to Timelock
    await router.transferOwnership(TREASURY);
    console.log("RevenueRouter ownership transferred to Timelock");

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log(`EXECUTION_REGISTRY: "${registry.target}",`);
    console.log(`REVENUE_ROUTER: "${router.target}",`);
    console.log(`PROJECT_FACTORY: "${factory.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
