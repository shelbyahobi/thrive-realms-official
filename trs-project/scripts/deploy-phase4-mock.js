const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying Phase 4 Contracts with account:", deployer.address);

    // 1. Deploy ReputationRegistry
    const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    const repAddress = await reputationRegistry.getAddress();
    console.log("ReputationRegistry deployed to:", repAddress);

    // 2. Mock Data: Give Deployer some Reputation
    // 0=Exec, 1=Report, 2=Gov, 3=Dispute
    console.log("Setting mock scores for deployer...");
    await reputationRegistry.updateScore(deployer.address, 0, 85); // Exec: 85
    await reputationRegistry.updateScore(deployer.address, 1, 90); // Report: 90
    await reputationRegistry.updateScore(deployer.address, 2, 75); // Gov: 75
    await reputationRegistry.updateScore(deployer.address, 3, 100); // Dispute: 100 (Perfect)

    // 3. Mock Data: Set Thresholds for Type 0 (Standard)
    // Min Exec: 80, Min Report: 80, Min Dispute: 90
    console.log("Setting Type 0 Thresholds...");
    await reputationRegistry.setTypeThresholds(0, 80, 80, 90);

    // 4. Verify Eligibility
    const eligible = await reputationRegistry.isFastTrackEligible(deployer.address, 0);
    console.log("Is Deployer Fast Track Eligible?", eligible);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
