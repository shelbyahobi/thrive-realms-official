const hre = require("hardhat");

const GOVERNOR_ADDR = "0x8a5F9557cfaf210D6d28b20722b4669599578E5A";
const TOKEN_ADDR = "0x9D4C2d67C049595da7Fd09aF94218A843cfA6d01";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Checking with account:", signer.address);

    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // 1. Check Voting Power
    const balance = await token.balanceOf(signer.address);
    const votes = await token.getVotes(signer.address);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} TRS`);
    console.log(`Votes:   ${hre.ethers.formatEther(votes)}`);

    if (balance > 0 && votes == 0) {
        console.warn("⚠️  WARNING: You have tokens but NO voting power. You must Delegate to yourself!");
    }

    // 2. Scan for Proposals
    console.log("Scanning for ProposalCreated events...");
    // Limit to last 5000 blocks to be fast
    const latestBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = latestBlock - 5000;

    const filter = gov.filters.ProposalCreated();
    const events = await gov.queryFilter(filter, fromBlock);

    console.log(`Found ${events.length} proposals in last 5000 blocks.`);

    for (const e of events) {
        console.log(`\nProposal ID: ${e.args[0]}`);
        console.log(`Proposer: ${e.args[1]}`);
        console.log(`Description: ${e.args[8].substring(0, 100)}...`);

        const state = await gov.state(e.args[0]);
        console.log(`State: ${state} (0=Pending, 1=Active, 2=Canceled, 3=Defeated, 4=Succeeded...)`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
