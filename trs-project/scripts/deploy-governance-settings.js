const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Load existing addresses to transfer ownership if needed (or just print it)
const TARGET_TIMELOCK = "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E"; // Phase 4 Timelock

async function main() {
    console.log("Deploying GovernanceSettings to network:", hre.network.name);

    const GovernanceSettings = await hre.ethers.getContractFactory("GovernanceSettings");
    const governanceSettings = await GovernanceSettings.deploy();

    await governanceSettings.waitForDeployment();
    const address = await governanceSettings.getAddress();

    console.log("✅ GovernanceSettings deployed to:", address);

    // Verification helper
    console.log("Waiting for block confirmations...");
    if (governanceSettings.deploymentTransaction()) {
        await governanceSettings.deploymentTransaction().wait(5);
    }

    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [],
        });
        console.log("✅ Verified on Etherscan/BscScan");
    } catch (error) {
        console.log("Verification failed (might be local network):", error.message);
    }

    // Transfer Ownership to Timelock
    if (TARGET_TIMELOCK) {
        console.log(`Transferring ownership to Timelock: ${TARGET_TIMELOCK}`);
        const tx = await governanceSettings.transferOwnership(TARGET_TIMELOCK);
        await tx.wait();
        console.log("✅ Ownership transferred");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
