const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    console.log("Debugging Proposals at:", GOVERNOR_ADDRESS);

    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    const gov = Governor.attach(GOVERNOR_ADDRESS);

    // Fetch ProposalCreated events (Limit range)
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = currentBlock - 20000;
    const filter = gov.filters.ProposalCreated();
    const events = await gov.queryFilter(filter, fromBlock, currentBlock);

    console.log(`Found ${events.length} proposals.`);
    console.log("Current Block:", currentBlock);

    for (const event of events) {
        const id = event.args[0];
        const proposer = event.args[1];
        const desc = event.args[8];
        const state = await gov.state(id);
        const snapshot = await gov.proposalSnapshot(id);
        const deadline = await gov.proposalDeadline(id);

        console.log(`\nProposal ID: ${id.toString()}`);
        console.log(`Proposer: ${proposer}`);
        console.log(`State: ${state} (0=Pending, 1=Active, 2=Canceled, 3=Defeated)`);
        console.log(`Snapshot: ${snapshot} (Current: ${currentBlock})`);
        console.log(`Deadline: ${deadline}`);
        console.log(`Desc: ${desc.substring(0, 50)}...`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
