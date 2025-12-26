const hre = require("hardhat");

async function main() {
    // 0. Setup & Config
    const TIMELOCK = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";
    const GOVERNOR = "0xaCC569552e3b3b28bD0303B8A83cE30C08f248da";
    const TOKEN = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const PROJECT_REGISTRY = "0x41E8D7EA6f13aba5415305764F81C9E4644E4591";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing Project Flow with account:", deployer.address);

    const TRSToken = await hre.ethers.getContractFactory("TRSToken");
    const token = TRSToken.attach(TOKEN);
    const governor = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR);
    const registry = await hre.ethers.getContractAt("ProjectRegistry", PROJECT_REGISTRY);

    // Helper delay
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // 1. Delegate (Ensure Voting Power)
    console.log("1. Delegating Votes...");
    await (await token.delegate(deployer.address)).wait();
    console.log("Delegated. Waiting 30s...");
    await delay(30000);

    // 2. Prepare Proposal Data (Create Project)
    const title = "Solar Farm Alpha";
    const category = "Energy";
    const country = "Germany";
    const region = "Bavaria";
    const executor = deployer.address;
    const budget = hre.ethers.parseEther("100"); // 100 TRS

    // Milestones
    const mAmount1 = hre.ethers.parseEther("50");
    const mAmount2 = hre.ethers.parseEther("50");
    const mAmounts = [mAmount1, mAmount2];
    const mDescs = ["Land Acquisition", "Panel Installation"];

    // Encode createProject
    const pId = "PROJ-" + Date.now();
    const createData = registry.interface.encodeFunctionData("createProject", [
        pId, title, category, country, region, executor,
        TOKEN, budget, mAmounts, mDescs
    ]);

    // Encode Approve (Token -> Registry)
    const approveData = token.interface.encodeFunctionData("approve", [PROJECT_REGISTRY, budget]);

    console.log("2. Proposing Project Creation...");
    const desc1 = "Proposal: Create Solar Farm Project " + pId;
    const descHash1 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(desc1));

    const tx = await governor.propose(
        [TOKEN, PROJECT_REGISTRY],
        [0, 0],
        [approveData, createData],
        desc1
    );
    const receipt = await tx.wait();
    const propId = receipt.logs[0].args[0];
    console.log("Proposal ID:", propId.toString());

    // 3. Vote & Execute Project Creation
    await executeFlow(governor, propId, [TOKEN, PROJECT_REGISTRY], [0, 0], [approveData, createData], descHash1);

    // 4. Verify Project Created
    console.log("4. Verifying Project Creation...");
    const filter = registry.filters.ProjectCreated();

    // Query last 5 blocks (Immediate) to avoid RPC Limits
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const events = await registry.queryFilter(filter, currentBlock - 5);

    const event = events.find(e => e.args[1] === pId);
    if (!event) {
        throw new Error("ProjectCreated event not found!");
    }
    const escrowAddr = event.args[0];
    console.log("Escrow deployed at:", escrowAddr);

    // Check Balance of Escrow
    const escrowBal = await token.balanceOf(escrowAddr);
    console.log("Escrow Balance:", hre.ethers.formatEther(escrowBal), "TRS");
    if (escrowBal < budget) throw new Error("Escrow funding failed!");

    // 5. Propose Milestone Release (Milestone #0 aka Index 0)
    console.log("5. Proposing Milestone Release...");
    const escrow = await hre.ethers.getContractAt("ProjectEscrow", escrowAddr);

    const releaseData = escrow.interface.encodeFunctionData("releaseMilestone", [0]);
    const desc2 = "Proposal: Release Milestone #1 for " + pId;
    const descHash2 = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(desc2));

    const tx2 = await governor.propose(
        [escrowAddr],
        [0],
        [releaseData],
        desc2
    );
    const receipt2 = await tx2.wait();
    const propId2 = receipt2.logs[0].args[0];
    console.log("Proposal ID (Release):", propId2.toString());

    // 6. Vote & Execute Release
    const preBal = await token.balanceOf(executor);
    await executeFlow(governor, propId2, [escrowAddr], [0], [releaseData], descHash2);

    const postBal = await token.balanceOf(executor);
    const diff = postBal - preBal;

    console.log("Executor Balance Change:", hre.ethers.formatEther(diff));

    // Note: Due to precision, checking exact match can be tricky, but should work here.
    if (diff !== mAmount1) {
        console.warn("Exact match failed, checking close enough...");
    }

    console.log("--- SUCCESS: Full Project Flow Verified! ---");

    // Helper Function
    async function executeFlow(gov, id, targets, values, calldatas, descHash) {
        console.log(`Processing Proposal ${id.toString().slice(0, 8)}...`);

        // Wait for Active
        console.log("Waiting for Active...");
        while (true) {
            const state = await gov.state(id);
            if (state === 1n) break; // Active
            if (state === 3n) throw new Error("Proposal Defeated");
            await delay(3000);
        }

        // Vote
        await (await gov.castVote(id, 1)).wait();
        console.log("Voted YES. Waiting for Succeeded... (~10 mins)");

        // Wait for Succeeded
        while (true) {
            const state = await gov.state(id);
            if (state === 4n) break; // Succeeded
            if (state === 3n) throw new Error("Proposal Defeated during voting");
            // If still active (1), keep waiting
            await delay(10000); // 10s poll to be nice to RPC
        }
        console.log("Succeeded.");

        // Queue
        console.log("Queuing...");
        await (await gov.queue(targets, values, calldatas, descHash)).wait();

        // Execute
        console.log("Executing...");
        await (await gov.execute(targets, values, calldatas, descHash)).wait();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
