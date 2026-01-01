const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying Phase 4 Automation with account:", deployer.address);

    // 0. ADDRESSES (We reuse existing registries where possible, but Factory/Rep need update)
    const EXECUTION_REGISTRY = hre.ethers.getAddress("0x8ffc8c871053b6b430255a4011f14748f05854dc");
    const POLICY_REGISTRY = hre.ethers.getAddress("0x94cfb7115857245b7803a0e8246e72f5015b601b");

    // 1. Deploy ReputationRegistry (Updated Logic)
    const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    const repAddr = await reputationRegistry.getAddress();
    console.log("ReputationRegistry deployed to:", repAddr);

    // 2. Deploy ProjectFactory (Updated Logic)
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const projectFactory = await ProjectFactory.deploy(
        EXECUTION_REGISTRY,
        POLICY_REGISTRY,
        repAddr
    );
    await projectFactory.waitForDeployment();
    const factoryAddr = await projectFactory.getAddress();
    console.log("ProjectFactory deployed to:", factoryAddr);

    // 3. WIRE IT UP: Authorize Factory to grant roles
    console.log("Authorizing ProjectFactory...");
    let tx = await reputationRegistry.grantAutomationRole(factoryAddr);
    await tx.wait();
    console.log("ProjectFactory Authorized!");

    // 4. SEED USER REPUTATION (So they don't lose access)
    const TARGET_USER = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";
    console.log(`Restoring Reputation for ${TARGET_USER}...`);
    try {
        await (await reputationRegistry.updateScore(TARGET_USER, 0, 95)).wait();
        await (await reputationRegistry.updateScore(TARGET_USER, 1, 98)).wait();
        await (await reputationRegistry.updateScore(TARGET_USER, 2, 90)).wait();
        await (await reputationRegistry.updateScore(TARGET_USER, 3, 100)).wait();
        // Set Thresholds
        await (await reputationRegistry.setTypeThresholds(0, 80, 80, 90)).wait();
        console.log("Reputation Restored.");
    } catch (e) {
        console.log("Seed failed:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
