const hre = require("hardhat");

async function main() {
    // Old Governor Address (from when user was on cached site)
    const OLD_GOVERNOR = "0x93D84DD8222E891eB1FDaBE8D01F03a873d6c5A1";
    console.log("Querying Old Governor:", OLD_GOVERNOR);

    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    const gov = Governor.attach(OLD_GOVERNOR);

    const filter = gov.filters.ProposalCreated();
    // Query last 10,000 blocks relative to current to find the recent proposal
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = currentBlock - 50000;

    const events = await gov.queryFilter(filter, fromBlock, currentBlock);
    console.log(`Found ${events.length} proposals on Old Governor.`);

    if (events.length > 0) {
        const lastEvent = events[events.length - 1];
        const proposer = lastEvent.args[1];
        console.log("Most Recent Proposer (User):", proposer);
    } else {
        console.log("No proposals found on old governor in search range.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
