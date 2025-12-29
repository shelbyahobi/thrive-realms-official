const hre = require("hardhat");

async function main() {
    console.log("--- STARTING DEMO VOTER SEQUENCE ---");

    // 1. Get Deployer (The Funding Source)
    const [deployer] = await hre.ethers.getSigners();
    console.log("Funding Source:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Source BNB Balance:", hre.ethers.formatEther(balance));

    // 2. Identify the Target Proposal (Latest)
    // We need contract addresses
    const GOVERNOR_ADDR = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    const TOKEN_ADDR = "0x2cEA540eDe529bf794C5555061CE963517d11DdA";

    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDR);
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // Find latest proposal
    // We can't query "latest" easily from contract, so we filter events again or user provides ID.
    // Better: Filter events like debug-proposals.js
    const propFilter = gov.filters.ProposalCreated();
    const specificEnd = await hre.ethers.provider.getBlockNumber();
    const specificStart = specificEnd - 50000; // Look back 50,000 blocks
    const events = await gov.queryFilter(propFilter, specificStart, specificEnd);

    if (events.length === 0) {
        console.error("No proposals found in last 5000 blocks.");
        return;
    }

    const latest = events[events.length - 1];
    const proposalId = latest.args.proposalId;
    console.log("Target Proposal ID:", proposalId.toString());

    // Check State
    const state = await gov.state(proposalId);
    console.log("Proposal State:", state.toString(), "(Expected: 1 = Active, 0 = Pending)");

    if (state.toString() !== "1") {
        console.log("⚠️ Proposal is NOT Active. It might be Pending (0).");
        console.log("If Pending, we cannot vote yet. Voting Delay is ~10 mins (200 blocks).");

        const deadline = await gov.proposalDeadline(proposalId);
        const snapshot = await gov.proposalSnapshot(proposalId);
        const currentBlock = await hre.ethers.provider.getBlockNumber();
        console.log(`Current Block: ${currentBlock}`);
        console.log(`Voting Starts at Block: ${snapshot + 1n}`);

        if (currentBlock <= snapshot) {
            console.log(`WAITING REQUIRED: ${snapshot + 1n - BigInt(currentBlock)} blocks remaining.`);
            return;
        }
    }

    // 3. Create a New Random Wallet
    const randomWallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
    console.log("\n--- CREATED DEMO VOTER ---");
    console.log("Address:", randomWallet.address);
    console.log("Private Key:", randomWallet.privateKey);

    // 4. Fund with BNB (Gas)
    const gasAmount = hre.ethers.parseEther("0.005");
    console.log(`Sending 0.005 BNB for Gas...`);
    const txGas = await deployer.sendTransaction({
        to: randomWallet.address,
        value: gasAmount
    });
    await txGas.wait();
    console.log("Gas Funded.");

    // 5. Fund with TRS (Voting Power)
    // Needs 12,000 threshold, let's give 50,000
    const trsAmount = hre.ethers.parseEther("50000");
    console.log(`Sending 50,000 TRS...`);
    const txTrs = await token.connect(deployer).transfer(randomWallet.address, trsAmount);
    await txTrs.wait();
    console.log("TRS Funded.");

    // 6. Delegate (Activate VP)
    console.log("Delegating Votes (Self)...");
    const tokenVoter = token.connect(randomWallet);
    const txDel = await tokenVoter.delegate(randomWallet.address);
    await txDel.wait();

    // Check VP
    const vp = await tokenVoter.getVotes(randomWallet.address);
    console.log("Demo Voter VP:", hre.ethers.formatEther(vp));

    // 7. Vote
    console.log("Casting Vote (Support=1)...");
    const govVoter = gov.connect(randomWallet);
    const txVote = await govVoter.castVote(proposalId, 1); // 0=Against, 1=For, 2=Abstain
    await txVote.wait();

    console.log("✅ VOTE CAST SUCCESSFULLY!");
    console.log("Check the UI to see the approval bar increase.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
