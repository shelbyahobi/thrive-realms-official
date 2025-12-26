const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDR = "0x0975b9a7D8FA0E6CaD8dB87f13AE8a56166e642E";
    const TOKEN_ADDR = "0xEa718B043f32b4C78616AD90375C46667ea130D3";

    const [proposer] = await hre.ethers.getSigners();
    console.log("Creating proposal with account:", proposer.address);

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // Check voting power
    const votes = await token.getVotes(proposer.address);
    console.log("Current Voting Power:", hre.ethers.formatEther(votes));

    if (votes === 0n) {
        console.log("Delegating votes to self...");
        await (await token.delegate(proposer.address)).wait();
        console.log("Delegated.");
    }

    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);

    try {
        console.log("Submitting Proposal...");
        const tx = await gov.propose(
            [TOKEN_ADDR], // Targets
            [0], // Values
            ["0x"], // Calldata (Empty for dummy)
            "Proposal #1: System Verification Test" // Description
        );
        console.log("Tx Hash:", tx.hash);
        await tx.wait();
        console.log("Proposal Created Successfully!");

        // Get Proposal ID
        const filter = gov.filters.ProposalCreated();
        const events = await gov.queryFilter(filter, -1); // Last block
        const id = events[0].args[0];
        console.log("Proposal ID:", id.toString());

    } catch (e) {
        console.error("Proposal Creation Failed:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
