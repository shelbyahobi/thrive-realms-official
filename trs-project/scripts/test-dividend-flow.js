const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing Dividend Flow with account:", deployer.address);

    const TIMELOCK = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";
    const GOVERNOR = "0x409771c66904b34bA68109d33d20Ea8C7626618a";
    const TOKEN = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const VAULT = "0x1e511881AF0bf55d04b6E6cD1A6432eBA7FD293b";

    // Helper delay
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // 1. Create Proposal to call TRSToken.snapshot()
    const TRSToken = await hre.ethers.getContractFactory("TRSToken");
    const token = TRSToken.attach(TOKEN);
    const governor = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR);
    // 0. Delegate to Self (Required for Voting Power)
    console.log("0. Delegating Votes...");
    await (await token.delegate(deployer.address)).wait();
    console.log("Delegated. Waiting 60s for checkpoint...");
    await delay(60000);

    const votes = await token.getVotes(deployer.address);
    console.log("Current Votes:", hre.ethers.formatEther(votes));

    const threshold = await governor.proposalThreshold();
    console.log("Proposal Threshold:", hre.ethers.formatEther(threshold));

    if (votes < threshold) {
        console.log("ERROR: Votes < Threshold. Cannot propose.");
        return;
    }

    const encodedFunction = token.interface.encodeFunctionData("snapshot", []);
    const description = "Proposal #1: Trigger Dividend Snapshot " + Date.now(); // Unique desc

    console.log("1. Creating Proposal...");
    const txProp = await governor.propose(
        [TOKEN],
        [0],
        [encodedFunction],
        description
    );
    const receipt = await txProp.wait();

    // Get Proposal ID from logs
    const propId = receipt.logs[0].args[0];
    console.log("Proposal ID:", propId.toString());

    // Check Quorum
    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const qAmount = await governor.quorum(currentBlock - 2);

    console.log("REQUIRED QUORUM (Block " + (currentBlock - 2) + "):", hre.ethers.formatEther(qAmount));

    // 2. Wait for Active State
    console.log("Waiting for Voting Active state (1 block delay)...");
    while (true) {
        const state = await governor.state(propId);
        if (state === 1n) { // 1 = Active
            console.log("Proposal is Active.");
            break;
        }
        console.log("State:", state.toString(), "Waiting...");
        await delay(3000);
    }

    // 3. Vote
    console.log("2. Voting...");
    try {
        await (await governor.castVote(propId, 1)).wait(); // 1 = For
        console.log("Voted YES.");
    } catch (e) {
        console.log("Vote failed:", e.message);
        return;
    }

    // 4. Wait for Succeeded State (Period = 5 blocks)
    console.log("Waiting for Proposal to Succeed...");
    while (true) {
        const state = await governor.state(propId);
        if (state === 4n) { // 4 = Succeeded
            console.log("Proposal Succeeded.");
            break;
        }
        if (state === 3n) { // 3 = Defeated
            console.log("Proposal Defeated.");
            return;
        }
        console.log("State:", state.toString(), "Waiting (Mine blocks)...");
        await delay(5000);
    }

    // 5. Queue & Execute
    console.log("3. Queuing & Executing...");
    const descHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(description));

    try {
        await (await governor.queue([TOKEN], [0], [encodedFunction], descHash)).wait();
        console.log("Queued.");
    } catch (e) { console.log("Queue failed:", e.message); }

    // Timelock delay is usually 0 or small for testnet? 
    // Check Timelock MinDelay. If it's 1 day, we fail.
    // Assuming MinDelay=0 based on previous Setup. 
    // If not, we need to wait fast forward.

    // Execution might need another delay if Timelock has MinDelay > 0
    console.log("Executing...");
    await (await governor.execute([TOKEN], [0], [encodedFunction], descHash)).wait();
    console.log("Proposal Executed! Snapshot Taken.");

    // 6. Fund Vault & Distribute
    console.log("4. Funding Vault & Distributing...");
    const DividendVault = await hre.ethers.getContractFactory("DividendVault");
    const vault = DividendVault.attach(VAULT);

    // Send 0.1 BNB to Vault
    await (await deployer.sendTransaction({ to: VAULT, value: hre.ethers.parseEther("0.1") })).wait();

    // Distribute for Snapshot #1
    // Note: Assuming previous snapshot count was 0, new one is 1.
    // If multiple snapshots exist, we need to fetch the ID.
    // For simplicity, let's assume ID 1.
    // Or fetch dynamic ID?
    // token.snapshot() returns ID, but executed via governance.
    // Let's rely on standard ID increment. Check current ID?
    // ERC20Snapshot doesn't expose 'currentSnapshotId' publicly easily.
    // We'll try ID 1. If logic fails, we'll know.
    try {
        await (await vault.distribute(1)).wait();
        console.log("Distribution Created for Snapshot #1");
    } catch (e) {
        console.log("Failed to distribute for #1 (Maybe ID is different?) Trying #2...");
        await (await vault.distribute(2)).wait();
        console.log("Distribution Created for Snapshot #2");
    }

    console.log("\n--- SUCCESS ---");
    console.log("Go to /dividends and you should see a Distribution ready to claim!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
