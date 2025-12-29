const hre = require("hardhat");

async function main() {
    // Address from the user's updated contracts.ts
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";

    console.log("Checking Governor at:", GOVERNOR_ADDRESS);
    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    const gov = Governor.attach(GOVERNOR_ADDRESS);

    const delay = await gov.votingDelay();
    const period = await gov.votingPeriod();
    const threshold = await gov.proposalThreshold();
    const quorum = await gov.quorumNumerator();

    console.log("--- LIVE PARAMETERS ---");
    console.log("Voting Delay:", delay.toString(), "blocks");
    console.log("Voting Period:", period.toString(), "blocks");
    console.log("Proposal Threshold:", threshold.toString());
    console.log("Quorum Numerator:", quorum.toString(), "%");

    const latestBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Current Block:", latestBlock);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
