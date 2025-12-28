const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("--- 🌍 Simulating Community Lifecycle ---");

    // Addresses
    const TOKEN_ADDRESS = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";
    const GOVERNOR_ADDRESS = "0x403E508F85e68336214A17E64b6e512403164964"; // From previous context or fetch dynamically

    // Contracts
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDRESS);
    const governor = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDRESS);

    // Create 3 Fake Members
    const members = [
        hre.ethers.Wallet.createRandom().connect(hre.ethers.provider),
        hre.ethers.Wallet.createRandom().connect(hre.ethers.provider),
        hre.ethers.Wallet.createRandom().connect(hre.ethers.provider)
    ];

    console.log("\n1. 👶 Onboarding New Members...");

    // Fund them with ETH for gas and TRS for voting
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        console.log(`   Assisting Member #${i + 1}: ${member.address.slice(0, 6)}...`);

        // Send Gas
        await deployer.sendTransaction({
            to: member.address,
            value: hre.ethers.parseEther("0.05")
        });

        // Send TRS (Simulate Buy) - 15,000 TRS (Voter Tier)
        await token.transfer(member.address, hre.ethers.parseEther("15000"));
    }

    console.log("\n2. ✅ Member Activation (Delegation)...");
    for (const member of members) {
        // Connect as member
        const memberToken = token.connect(member);

        // Delegate to self
        const tx = await memberToken.delegate(member.address);
        await tx.wait();

        const votes = await token.getVotes(member.address);
        console.log(`   Member ${member.address.slice(0, 6)}... Voting Power: ${hre.ethers.formatEther(votes)}`);
    }

    console.log("\n3. 🗳️  Participation (Creating & Voting)...");

    // Deployer creates a proposal (Members have 15k, need 24k to propose)
    console.log("   (Deployer creating a 'Community Grant' proposal...)");
    const transferCalldata = token.interface.encodeFunctionData("transfer", [members[0].address, hre.ethers.parseEther("100")]);
    const propTx = await governor.propose(
        [TOKEN_ADDRESS],
        [0],
        [transferCalldata],
        "Community Grant: 100 TRS for Member #1"
    );
    const receipt = await propTx.wait();

    // Get Proposal ID (Logs[0] usually)
    // For simulation speed, we might not be able to vote immediately due to Voting Delay.
    // We check the delay.
    const delay = await governor.votingDelay();
    console.log(`   Voting Delay is ${delay} blocks. Mining...`);

    // Mine blocks to open voting
    await hre.network.provider.send("hardhat_mine", [hre.ethers.toBeHex(BigInt(delay) + 1n)]);

    // Find Proposal ID - simplistic way: scan last event
    const filter = governor.filters.ProposalCreated();
    const events = await governor.queryFilter(filter, -100);
    const proposalId = events[events.length - 1].args[0];

    console.log(`   Voting on Proposal ID: ${proposalId.toString().slice(0, 10)}...`);

    // Members Vote
    for (const member of members) {
        const memberGov = governor.connect(member);
        const voteTx = await memberGov.castVote(proposalId, 1); // 1 = For
        await voteTx.wait();
        console.log(`   Member ${member.address.slice(0, 6)}... Voted YES!`);
    }

    const state = await governor.state(proposalId);
    console.log(`   Proposal State: ${state} (Active)`);

    console.log("\n--- ✨ Simulation Complete: The Flow Works! ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
