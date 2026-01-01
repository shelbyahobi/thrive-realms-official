const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Seeding Phase 4 Data with account:", deployer.address);

    // Address from previous failed run output
    const REP_ADDRESS = "0xf0498611AE945C51CB7844Df4b4156B50a50A746";

    const ReputationRegistry = await hre.ethers.getContractAt("ReputationRegistry", REP_ADDRESS);

    // 1. Mock Data: Give Deployer some Reputation
    // 0=Exec, 1=Report, 2=Gov, 3=Dispute
    console.log("Setting mock scores for deployer...");
    try {
        // Send one by one to avoid nonce issues or gas limits
        let tx = await ReputationRegistry.updateScore(deployer.address, 0, 85); // Exec: 85
        await tx.wait();
        console.log("Exec Score Set");

        tx = await ReputationRegistry.updateScore(deployer.address, 1, 90); // Report: 90
        await tx.wait();
        console.log("Report Score Set");

        tx = await ReputationRegistry.updateScore(deployer.address, 2, 75); // Gov: 75
        await tx.wait();
        console.log("Gov Score Set");

        tx = await ReputationRegistry.updateScore(deployer.address, 3, 100); // Dispute: 100
        await tx.wait();
        console.log("Dispute Score Set");
    } catch (e) {
        console.log("Score update failed:", e.message);
    }

    // 2. Mock Data: Set Thresholds for Type 0 (Standard)
    console.log("Setting Type 0 Thresholds...");
    try {
        const tx = await ReputationRegistry.setTypeThresholds(0, 80, 80, 90);
        await tx.wait();
        console.log("Thresholds Set");
    } catch (e) {
        console.log("Threshold update failed:", e.message);
    }

    // 3. Verify Eligibility
    const eligible = await ReputationRegistry.isFastTrackEligible(deployer.address, 0);
    console.log("Is Deployer Fast Track Eligible now?", eligible);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
