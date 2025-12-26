const hre = require("hardhat");

async function main() {
    console.log("🚀 Starting Governance Simulation...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Actor:", deployer.address);

    const GOVERNOR_ADDR = "0x3Dc86Bf4B187e279D60a2bc08dcC74eB68d87eC6";
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";

    const governor = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // 1. Delegate
    console.log("\n1️⃣  Checking Delegation...");
    const currentDelegate = await token.delegates(deployer.address);
    if (currentDelegate !== deployer.address) {
        console.log("Delegating to self...");
        const tx = await token.delegate(deployer.address);
        await tx.wait();
        console.log("✅ Delegated.");
    } else {
        console.log("✅ Already Delegated.");
    }

    // 1.1 Verify Voting Power matches Balance
    const balance = await token.balanceOf(deployer.address);
    const votes = await token.getVotes(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance));
    console.log("Votes:  ", hre.ethers.formatEther(votes));

    if (votes < hre.ethers.parseEther("24000")) {
        console.error("❌ INSUFFICIENT VOTES TO PROPOSE (Need 24k).");
        return;
    }

    // 2. Propose
    console.log("\n2️⃣  Creating Proposal...");
    const targets = [TOKEN_ADDR];
    const values = [0];
    const calldatas = [token.interface.encodeFunctionData("totalSupply", [])]; // Dummy action
    const description = "Simulation Proposal #" + Date.now();

    const txProp = await governor.propose(targets, values, calldatas, description);
    console.log("Tx Sent. Waiting for confirmation...");
    const receipt = await txProp.wait();

    // Extract Proposal ID
    const log = receipt.logs.find(x => x.fragment && x.fragment.name === 'ProposalCreated');
    // Hardhat sometimes doesn't parse logs automatically with limited ABI visibility, 
    // but assuming standard environment it works. 
    // If not, we fetch by filtering.

    let proposalId;
    if (log) {
        proposalId = log.args[0];
    } else {
        // Fallback
        const filter = governor.filters.ProposalCreated();
        const events = await governor.queryFilter(filter, -5);
        proposalId = events[events.length - 1].args[0];
    }

    console.log("✅ Proposal Created! ID:", proposalId.toString());

    // 3. Wait for Active State
    console.log("\n3️⃣  Waiting for Voting Update...");
    // Delay is 0 blocks, but we need next block for snapshot
    // But Governor settings might have VotingDelay > 0? 
    // Checked DAO.js: delay = 0.

    let state = await governor.state(proposalId);
    console.log("Current State:", state.toString(), "(0=Pending, 1=Active)");

    if (state === 0n) {
        console.log("State is Pending. Mining 1 block just in case (sending 0 eth to self)...");
        await deployer.sendTransaction({ to: deployer.address, value: 0 });
        state = await governor.state(proposalId);
        console.log("New State:", state.toString());
    }

    if (state !== 1n) {
        console.error("❌ Stats is not Active. Cannot vote.");
        return;
    }

    // 4. Vote
    console.log("\n4️⃣  Casting Vote...");
    const txVote = await governor.castVote(proposalId, 1); // 1 = For
    console.log("Vote Tx Sent:", txVote.hash);
    await txVote.wait();

    const hasVoted = await governor.hasVoted(proposalId, deployer.address);
    if (hasVoted) {
        console.log("✅ Vote SUCCESSFUL!");
    } else {
        console.log("❌ Vote failed (hasVoted is false).");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
