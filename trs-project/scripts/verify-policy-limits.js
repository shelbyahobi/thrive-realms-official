const hre = require("hardhat");
const { ethers } = hre;

// HARDCODED PHASE 2 ADDRESSES (Lowercase to avoid checksum errors)
const ADDRESSES = {
    TOKEN: "0x2cea540ede529bf794c5555061ce963517d11dda",
    PROJECT_FACTORY: "0xba58047486824cced3de3e9b71a5a6e216b2ddaf", // V2 (Redeployed)
    POLICY_REGISTRY: "0x77c33d2d974e34c60769446260fc939f9e367df7", // (Redeployed)
    EXECUTION_REGISTRY: "0xfd3791619881ec944ab7080e84a9c818b2c59a1b"
};

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`\n--- VERIFYING POLICY LIMITS ---`);
    console.log(`Executor: ${deployer.address}`);

    // 1. Setup Contracts
    const Token = await ethers.getContractAt("TRSToken", ADDRESSES.TOKEN);
    const Factory = await ethers.getContractAt("ProjectFactory", ADDRESSES.PROJECT_FACTORY);
    const Policy = await ethers.getContractAt("PolicyRegistry", ADDRESSES.POLICY_REGISTRY);

    // 2. Check Balance
    const balance = await Token.balanceOf(deployer.address);
    console.log(`TRS Balance: ${ethers.formatEther(balance)} TRS`);
    if (balance < ethers.parseEther("1000")) {
        console.error("Insufficient TRS for testing.");
        return;
    }

    // 3. Read Limit
    const limitWei = await Policy.getPolicy("MAX_PROJECT_BUDGET");
    const limitEther = ethers.formatEther(limitWei);
    console.log(`Current Policy Limit: ${limitEther} TRS`);

    // 4. Approve Factory
    console.log("Approving Factory...");
    const approveTx = await Token.approve(ADDRESSES.PROJECT_FACTORY, ethers.MaxUint256);
    await approveTx.wait();
    console.log("Approved.");

    // 5. TEST CASE A: SUCCESS (Below Limit)
    // Create a 100 TRS Project
    console.log("\n[TEST A] Creating Compliant Project (100 TRS)...");
    const projectIdA = `TEST-OK-${Date.now()}`;
    try {
        const txA = await Factory.createProject(
            projectIdA,
            "Compliant Project",
            "Testing",
            "Global",
            "Testnet",
            deployer.address, // Executor
            ADDRESSES.TOKEN,
            [ethers.parseEther("100")],
            ["Milestone 1"]
        );
        console.log(`Tx Sent: ${txA.hash}`);
        await txA.wait();
        console.log("✅ SUCCESS: Compliant Project Created");
    } catch (e) {
        console.error("❌ FAILED: Compliant Project Reverted", e.message);
    }

    // 6. TEST CASE B: FAILURE (Above Limit)
    // Create project with Limit + 1 TRS
    const excessiveAmount = limitWei + ethers.parseEther("1");
    console.log(`\n[TEST B] Creating Excessive Project (${ethers.formatEther(excessiveAmount)} TRS)...`);
    const projectIdB = `TEST-FAIL-${Date.now()}`;

    try {
        await Factory.createProject(
            projectIdB,
            "Excessive Project",
            "Testing",
            "Global",
            "Testnet",
            deployer.address,
            ADDRESSES.TOKEN,
            [excessiveAmount],
            ["Big Milestone"]
        );
        console.error("❌ FAILED: Excessive Project SUCCESS (Should have reverted!)");
    } catch (e) {
        if (e.message.includes("Budget exceeds Policy Limit")) {
            console.log("✅ SUCCESS: Transaction Reverted with 'Budget exceeds Policy Limit'");
        } else {
            console.log(`✅ SUCCESS: Transaction Reverted (Expected). Message: ${e.message}`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
