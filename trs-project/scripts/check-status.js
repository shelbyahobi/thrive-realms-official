const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDRESS);

    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const filter = gov.filters.ProposalCreated();
    // Search last 5000 blocks
    const events = await gov.queryFilter(filter, currentBlock - 5000, currentBlock);

    if (events.length === 0) {
        console.log("No recent proposals found.");
        return;
    }

    const lastProposal = events[events.length - 1];
    const pid = lastProposal.args[0];
    const snapshot = await gov.proposalSnapshot(pid);

    console.log(`Latest Proposal ID: ${pid}`);
    console.log(`Snapshot Block: ${snapshot}`);
    console.log(`Current Block: ${currentBlock}`);

    if (snapshot > currentBlock) {
        const blocksLeft = snapshot - currentBlock;
        const timeSec = blocksLeft * 3; // BSC is ~3s per block
        console.log(`STATUS: PENDING`);
        console.log(`Voting Starts in: ${blocksLeft} blocks (~${Math.ceil(timeSec / 60)} minutes)`);
    } else {
        console.log(`STATUS: ACTIVE (Voting should be open)`);
    }
}

main().catch(console.error);
