const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDR = "0x0975b9a7D8FA0E6CaD8dB87f13AE8a56166e642E"; // From contracts.ts
    console.log("Searching for proposals on Governor:", GOVERNOR_ADDR);

    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);

    // Get current block
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Current Block:", currentBlock);

    // Search in chunks of 5000 to avoid timeouts/limits
    const chunkSize = 5000;
    const maxDepth = 200000;

    let proposalCount = 0;

    for (let i = 0; i < maxDepth; i += chunkSize) {
        const toBlock = currentBlock - i;
        const fromBlock = Math.max(0, toBlock - chunkSize);

        console.log(`Scanning blocks ${fromBlock} -> ${toBlock}...`);

        try {
            const events = await gov.queryFilter(gov.filters.ProposalCreated(), fromBlock, toBlock);
            if (events.length > 0) {
                console.log(`FOUND ${events.length} PROPOSALS!`);
                events.forEach(e => {
                    console.log(`- ID: ${e.args[0]}`);
                    console.log(`  Proposer: ${e.args[1]}`);
                    console.log(`  Description: ${e.args[8].substring(0, 50)}...`);
                });
                proposalCount += events.length;
            }
        } catch (e) {
            console.error(`Error scanning chunk: ${e.message}`);
        }

        if (fromBlock === 0) break;
    }

    if (proposalCount === 0) {
        console.log("\nCONCLUSION: No proposals found in the last 200k blocks.");
        console.log("Possibilities:");
        console.log("1. Wrong Governor Address.");
        console.log("2. Proposals were created > 1 week ago.");
        console.log("3. No proposals have ever been created on THIS contract.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
