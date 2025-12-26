const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDR = "0x3Dc86Bf4B187e279D60a2bc08dcC74eB68d87eC6"; // Updated secure address

    const governor = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);

    console.log("Fetching ProposalCreated events...");

    // Get current block
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const fromBlock = currentBlock - 1000;

    const filter = governor.filters.ProposalCreated();
    const events = await governor.queryFilter(filter, fromBlock);

    if (events.length === 0) {
        console.log("No proposals found.");
        return;
    }

    const latestEvent = events[events.length - 1];
    const proposalId = latestEvent.args.proposalId;

    console.log("Latest Proposal ID:", proposalId.toString());

    // Check State
    // Enum: Pending(0), Active(1), Canceled(2), Defeated(3), Succeeded(4), Queued(5), Expired(6), Executed(7)
    const state = await governor.state(proposalId);
    const stateStr = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"][state];

    console.log("Current State:", state.toString(), `(${stateStr})`);

    const USER_ADDR = "0x07d3cc2f780fee6969814e53441cb27054e39e4b";
    const tokenAddr = await governor.token();
    const token = await hre.ethers.getContractAt("TRSToken", tokenAddr);

    console.log("-------------------------------------------------");
    console.log("Checking Voting Eligibility for:", USER_ADDR);

    // Check Voting Power at Snapshot
    let votesAtSnapshot = 0n;
    try {
        votesAtSnapshot = await token.getPastVotes(USER_ADDR, snapshot);
        console.log(`Votes at Snapshot (${snapshot}): ${hre.ethers.formatEther(votesAtSnapshot)}`);
    } catch (e) {
        console.log("Error checking past votes:", e.message);
    }

    // Check if already voted
    const hasVoted = await governor.hasVoted(proposalId, USER_ADDR);
    console.log("Has Voted:", hasVoted);

    console.log("-------------------------------------------------");

    if (state !== 1) { // 1 = Active
        console.log("❌ Vote Failed because Proposal is NOT Active.");
    } else if (votesAtSnapshot === 0n) {
        console.log("❌ Vote Failed because you had 0 Votes at Snapshot.");
        console.log("   (You delegated AFTER the proposal was created?)");
    } else if (hasVoted) {
        console.log("❌ Vote Failed because you ALREADY voted.");
    } else {
        console.log("✅ You CAN vote! (If current block <= deadline)");
    }

    // Check Blocks
    const snapshot = await governor.proposalSnapshot(proposalId);
    const deadline = await governor.proposalDeadline(proposalId);

    // Check current block again (or reuse previous)
    const currentBlockNow = await hre.ethers.provider.getBlockNumber();

    console.log("Snapshot Block:", snapshot.toString());
    console.log("Deadline Block:", deadline.toString());
    console.log("Current Block: ", currentBlockNow.toString());

    if (currentBlockNow <= deadline) {
        console.log("✅ Voting Period is currently OPEN.");
    } else {
        console.log("❌ Voting Period has ENDED.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
