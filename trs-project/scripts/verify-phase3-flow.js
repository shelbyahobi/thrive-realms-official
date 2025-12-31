const hre = require("hardhat");

async function main() {
    console.log("--- PHASE 3 E2E VERIFICATION (Simulation) ---");

    // Deploy Mock Contracts for Simulation
    const TimelockAddr = "0x95ff3eb798e2970e471c888fb095c496d67d7a5e"; // We will still impersonate this as "Owner" for realism, OR just use deployer as owner first then transfer.

    // Actually, for local logic verification, it's easier to own them with deployer first.
    const [deployer] = await hre.ethers.getSigners();
    console.log("Simulating with deployer:", deployer.address);

    // 1. Deploy GovernanceSettings
    const GovSettingsFactory = await hre.ethers.getContractFactory("GovernanceSettings");
    const GovSettings = await GovSettingsFactory.deploy();
    await GovSettings.waitForDeployment();
    console.log("Mock GovSettings deployed:", GovSettings.target);

    // 2. Deploy ExecutionRegistry
    const ExecRegistryFactory = await hre.ethers.getContractFactory("ExecutionRegistry");
    const ExecRegistry = await ExecRegistryFactory.deploy();
    await ExecRegistry.waitForDeployment();
    console.log("Mock ExecRegistry deployed:", ExecRegistry.target);

    // Assign Owner to Timelock (to test impersonation) or keep as deployer?
    // Let's keep as deployer for speed, simulating the Timelock calls by just calling from deployer.
    // If we want to test Timelock *integration*, we need a Timelock contract. 
    // Let's stick to contract logic verification:
    const ownerSigner = deployer;

    // Impersonate Timelock for Owner Actions (No longer needed as deployer is owner)
    // await hre.network.provider.request({
    //     method: "hardhat_impersonateAccount",
    //     params: [TIMELOCK_ADDR],
    // });
    // const timelockSigner = await hre.ethers.getSigner(TIMELOCK_ADDR);
    const timelockSigner = ownerSigner; // Use deployer as the "timelockSigner" for newly deployed contracts

    // Fund Timelock with BNB for gas (No longer needed as deployer is owner)
    // await deployer.sendTransaction({
    //     to: TIMELOCK_ADDR,
    //     value: hre.ethers.parseEther("1.0")
    // });
    // console.log("Funded Timelock for simulation");

    // 1. CHECK INITIAL STATE
    let phase = await GovSettings.currentPhase();
    console.log("Current Phase:", phase.toString());
    // Expect 0 (GOVERNANCE_ONLY) or 1/2 if already tested. 
    // Note: If running against live testnet, state persists. If local fork, resets.

    if (phase == 0n) {
        console.log("\n[SIMULATING PHASE 1: Legal Structure]");
        // setLegalStructure(type, jurisdiction, scope, controlModel, budget, facilitator)
        await GovSettings.connect(ownerSigner).setLegalStructure(
            0, // DAO_LLC
            "Wyoming",
            ["Equity", "Contracts"],
            1, // TIMELOCK
            hre.ethers.parseEther("50000"), // 50k Budget
            deployer.address // Facilitator
        );
        console.log("Legal Structure Set.");
        phase = await GovSettings.currentPhase();
        console.log("New Phase:", phase.toString(), "(Expected 1: LEGAL_STRUCTURE_APPROVED)");
    }

    if (phase == 1n) {
        console.log("\n[SIMULATING PHASE 2: Legal Setup Funding]");
        // authorizeLegalSetupFunding(executor, amount)
        await GovSettings.connect(ownerSigner).authorizeLegalSetupFunding(
            deployer.address,
            hre.ethers.parseEther("5000")
        );
        console.log("Funding Authorized.");
        phase = await GovSettings.currentPhase();
        console.log("New Phase:", phase.toString(), "(Expected 2: LEGAL_SETUP_IN_PROGRESS)");
    }

    console.log("\n[SIMULATING PHASE 3: Execution Registry Ops]");

    // Authorize Fiat Bridge
    const bridgeAddr = "0x0000000000000000000000000000000000000001"; // Mock
    await ExecRegistry.connect(ownerSigner).authorizeFiatBridge(
        bridgeAddr,
        hre.ethers.parseEther("100000") // Cap
    );
    let bridgeProfile = await ExecRegistry.getEntity(bridgeAddr);
    console.log("Bridge Registered?", bridgeProfile.entityType == 2n); // 2 = FIAT_BRIDGE (assuming enum)

    // Create Pod
    const podAddr = "0x0000000000000000000000000000000000000002"; // Mock
    await ExecRegistry.connect(ownerSigner).createPod(
        podAddr,
        deployer.address,
        hre.ethers.parseEther("10000")
    );
    let podProfile = await ExecRegistry.getEntity(podAddr);
    console.log("Pod Registered?", podProfile.entityType == 3n); // 3 = EXECUTION_POD

    console.log("--- VERIFICATION COMPLETE ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
