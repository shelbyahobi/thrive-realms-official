const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const TARGET_USER = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";
    const REP_ADDRESS = "0xf0498611AE945C51CB7844Df4b4156B50a50A746"; // Phase 4 Deployment

    console.log(`Granting Reputation to ${TARGET_USER} on contract ${REP_ADDRESS}...`);

    const ReputationRegistry = await hre.ethers.getContractAt("ReputationRegistry", REP_ADDRESS);

    // Grant High Scores
    // 0=Exec, 1=Report, 2=Gov, 3=Dispute
    try {
        console.log("- Setting Execution Score to 95...");
        let tx = await ReputationRegistry.updateScore(TARGET_USER, 0, 95);
        await tx.wait();

        console.log("- Setting Reporting Score to 98...");
        tx = await ReputationRegistry.updateScore(TARGET_USER, 1, 98);
        await tx.wait();

        console.log("- Setting Governance Score to 90...");
        tx = await ReputationRegistry.updateScore(TARGET_USER, 2, 90);
        await tx.wait();

        console.log("- Setting Dispute (Risk) Score to 100...");
        tx = await ReputationRegistry.updateScore(TARGET_USER, 3, 100);
        await tx.wait();

        console.log("✅ Reputation Granted Successfully!");

        const eligible = await ReputationRegistry.isFastTrackEligible(TARGET_USER, 0);
        console.log(`Fast Track Eligibility: ${eligible}`);

    } catch (e) {
        console.error("Failed to grant reputation:", e.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
