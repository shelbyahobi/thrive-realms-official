const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDRESS);

    // Find latest proposal
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const filter = gov.filters.ProposalCreated();
    const events = await gov.queryFilter(filter, currentBlock - 5000, currentBlock);

    if (events.length === 0) {
        console.log("No proposals found.");
        return;
    }

    const lastProposal = events[events.length - 1];
    const pid = lastProposal.args[0];
    const targets = lastProposal.args[2];
    const values = lastProposal.args[3];
    const calldatas = lastProposal.args[4];
    const description = lastProposal.args[8];

    console.log(`Voting on Proposal ID: ${pid}`);
    console.log(`Proposer: ${lastProposal.args[1]}`);
    console.log(`Targets:`, targets);
    console.log(`Values:`, values);
    console.log(`Description: ${description.substring(0, 50)}...`);

    // Cast Vote (1 = For)
    console.log("Casting Vote (Deployer)...");
    const tx = await gov.connect(deployer).castVote(pid, 1);
    await tx.wait();
    console.log("Vote Cast Successfully!");

    // Check Votes
    const votes = await gov.proposalVotes(pid);
    console.log(`Current Votes - For: ${hre.ethers.formatEther(votes[1])}, Against: ${hre.ethers.formatEther(votes[0])}`);

    // Analyze Calldata
    if (targets.length === 0 || targets[0] === hre.ethers.ZeroAddress) {
        console.log("ANALYSIS: This appears to be a Signal/Text Proposal (No on-chain actions).");
    } else {
        console.log("ANALYSIS: This proposal contains On-Chain Actions.");
    }
}

main().catch(console.error);
