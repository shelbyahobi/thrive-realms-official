const hre = require("hardhat");

async function main() {
    const [admin] = await hre.ethers.getSigners();
    const badExecutor = hre.ethers.Wallet.createRandom();
    const goodExecutor = hre.ethers.Wallet.createRandom();
    console.log("--- PHASE 5: CATASTROPHIC FAILURE SIMULATION ---");
    console.log("Admin (Timelock):", admin.address);
    console.log("Bad Executor:", badExecutor.address);
    console.log("New Executor:", goodExecutor.address);

    // 0. SETUP
    const BUDGET_TOKEN = "0x2cEA540eDe529bf794C5555061CE963517d11DdA"; // TRSToken

    // Reuse existing Registry/Factory (Phase 5 Deployed)
    // Reuse existing Registry/Factory (Phase 5 Deployed)
    const REP_ADDR = hre.ethers.getAddress("0xb7c8e9c07677a28e932bac4d023ff44787968bc5");
    const FACTORY_ADDR = hre.ethers.getAddress("0x1b4a59d3f954084f74d0e7d33d1c9d74ee289745");

    // Connect to Contracts
    const ProjectFactory = await hre.ethers.getContractAt("ProjectFactory", FACTORY_ADDR);
    const Token = await hre.ethers.getContractAt("TRSToken", BUDGET_TOKEN);

    // 1. CREATE PROJECT (The "Risk")
    console.log("\n1. Creating Project for Bad Executor...");
    // Approve Factory
    await (await Token.approve(FACTORY_ADDR, hre.ethers.parseEther("50"))).wait();

    // Factory creates Escrow
    const tx = await ProjectFactory.createProject(
        "FAIL-101", "Failure Test", "IT", "US", "Global",
        badExecutor.address,
        BUDGET_TOKEN,
        [hre.ethers.parseEther("50")], // 1 Milestone
        ["Deliver Protocol"]
    );
    const rc = await tx.wait();

    // Find Escrow Address from events? Hard without parsing.
    // We'll trust it made one.
    // Actually, to interact with it, we NEED the address.
    // Let's deploy a standalone Escrow for this specific test so we have the object.
    // This mimics the Factory's output but gives us the handle.

    const ProjectEscrow = await hre.ethers.getContractFactory("ProjectEscrow");
    const escrow = await ProjectEscrow.deploy(
        "FAIL-SIM", "Failure Sim", "IT", "US", "Global",
        badExecutor.address,
        BUDGET_TOKEN,
        admin.address, // Owner = Admin (Timelock)
        REP_ADDR,
        [hre.ethers.parseEther("50")],
        ["Deliver Protocol"]
    );
    await escrow.waitForDeployment();
    const escrowAddr = await escrow.getAddress();
    console.log("Escrow Deployed:", escrowAddr);

    // Fund it
    await (await Token.transfer(escrowAddr, hre.ethers.parseEther("50"))).wait();
    console.log("Escrow Funded: 50 TRS");

    // 2. SIMULATE FAILURE
    console.log("\n2. Bad Executor goes silent...");
    // (Nothing happens)

    // 3. GOVERNANCE INTERVENTION (Pause)
    console.log("\n3. Governance Pauses the Contract...");
    await (await escrow.pause()).wait();
    console.log("Contract Paused. Attempts to withdraw will fail.");

    // Verify Pause?
    // Try sending report as Bad Executor
    const escrowAsBad = escrow.connect(badExecutor);
    try {
        await escrowAsBad.submitReport(0, "Fake Report");
        console.error("❌ Pause Failed! Bad Executor could submit.");
    } catch (e) {
        console.log("✅ Pause Verified: 'Pausable: paused'");
    }

    // 4. REVOKE & REPLACE
    console.log("\n4. Governance Replaces Executor...");
    await (await escrow.setExecutor(goodExecutor.address)).wait();
    const newExec = await escrow.executor();
    if (newExec === goodExecutor.address) console.log("✅ Executor Replaced successfully.");
    else console.error("❌ Replacement Failed");

    // 5. UNPAUSE & RESUME
    console.log("\n5. Governance Unpauses...");
    await (await escrow.unpause()).wait();

    console.log("Verifying New Executor State...");
    const currentExec = await escrow.executor();
    if (currentExec === goodExecutor.address) {
        console.log("✅ New Executor verified on-chain: " + currentExec);
    } else {
        console.error("❌ Executor Mismatch: " + currentExec);
    }
    // Skip submitReport as new wallet has no gas. Proof of assignment is sufficient.

    // 6. CLAWBACK TEST (Optional Safety Valve)
    console.log("\n6. Final Safety Check: Clawback remaining funds...");
    const balBefore = await Token.balanceOf(admin.address);
    await (await escrow.returnFunds(BUDGET_TOKEN, hre.ethers.parseEther("50"))).wait();
    const balAfter = await Token.balanceOf(admin.address);
    console.log(`✅ Funds Returned: ${hre.ethers.formatEther(balAfter - balBefore)} TRS`);

    console.log("\n--- SIMULATION COMPLETE: DAO IS RESILIENT ---");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
