const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. Deploy Token (owner, treasury)
    // Initially setting Treasury to deployer, will transfer to Timelock later
    const Token = await hre.ethers.getContractFactory("TRSToken");
    const token = await Token.deploy(deployer.address, deployer.address);
    await token.waitForDeployment();
    console.log("TRSToken deployed to:", token.target);

    // 1b. Auto-Delegate to Deployer (Fixes "0 Snapshot Power" issue for Admin)
    await (await token.delegate(deployer.address)).wait();
    console.log("Auto-Delegated Voting Power to Deployer");

    // 2. Deploy Timelock (minDelay = 0 for dev)
    const Timelock = await hre.ethers.getContractFactory("TRSTimelock");
    // Phase 1 Compliance: 48h (172800s) for public networks, 0 for local/hardhat
    const networkName = hre.network.name;
    const minDelay = (networkName === "bscTestnet" || networkName === "bscMainnet") ? 300 : 0; // 5 mins for Testnet (Audit Proof), 0 for Dev
    // NOTE: For Mainnet, change 300 to 172800
    console.log(`Deploying Timelock with Delay: ${minDelay} seconds`);
    const proposers = [deployer.address];
    const executors = [deployer.address];
    const admin = deployer.address;

    // Constructor: (minDelay, proposers, executors, admin)
    const timelock = await Timelock.deploy(minDelay, proposers, executors, admin);
    await timelock.waitForDeployment();
    console.log("TRSTimelock deployed to:", timelock.target);

    // 3. Deploy Governor
    // Params: token, timelock, delay (1 block), period (5 mins/20 blocks), threshold (0), quorum (4%)
    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    // TESTNET PARAMS:
    // Delay: 1 block (Fast start)
    // Period: 600 blocks (~30 mins) - Enough to test but doesn't wait forever
    // Threshold: 100 TRS (Low barrier for testing)
    // Quorum: 0% (Allows passing with just 1 vote if 0 is supported, otherwise 1%)
    // Note: Quorum Fraction 0 might revert in some OZ versions, trying 1% (1).
    const governanceThreshold = hre.ethers.parseEther("100"); // 100 TRS

    // Re-instantiating with Quorum 0:
    const governor = await Governor.deploy(
        token.target,
        timelock.target,
        1, // delay
        600, // period
        governanceThreshold,
        0 // 0% Quorum
    );
    await governor.waitForDeployment();
    console.log("TRSGovernor (Testnet Mode) deployed to:", governor.target);

    // 4. Create Sale
    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = await Sale.deploy(token.target, timelock.target);
    await sale.waitForDeployment();
    console.log("TRSSale deployed to:", sale.target);

    // 5. Deploy ExecutionRegistry
    const Registry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    console.log("ExecutionRegistry deployed to:", registry.target);

    // 5b. Deploy PolicyRegistry (Required by Factory)
    const PolicyRegistry = await hre.ethers.getContractFactory("PolicyRegistry");
    const policyRegistry = await PolicyRegistry.deploy();
    await policyRegistry.waitForDeployment();
    console.log("PolicyRegistry deployed to:", policyRegistry.target);

    // 5c. Deploy ReputationRegistry (Required by Factory & Escrow)
    const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
    const reputationRegistry = await ReputationRegistry.deploy();
    await reputationRegistry.waitForDeployment();
    console.log("ReputationRegistry deployed to:", reputationRegistry.target);

    // 5d. Deploy ProjectFactory
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy(
        registry.target,
        policyRegistry.target,
        reputationRegistry.target
    );
    await factory.waitForDeployment();
    console.log("ProjectFactory deployed to:", factory.target);

    // Grant Factory ability to authorize new projects in ReputationRegistry
    await (await reputationRegistry.grantAutomationRole(factory.target)).wait();
    console.log("Granted Factory automation role in ReputationRegistry");

    // 6. Deploy Dividend Vault (Treasury/Staking)
    const DividendVault = await hre.ethers.getContractFactory("DividendVault");
    const dividendVault = await DividendVault.deploy(token.target);
    await dividendVault.waitForDeployment();
    console.log("DividendVault deployed to:", dividendVault.target);

    // 7. Deploy Founder Splitter (Ops)
    // Using deployer as sole payee for testnet simplicity
    const FounderSplitter = await hre.ethers.getContractFactory("FounderSplitter");
    const founderSplitter = await FounderSplitter.deploy([deployer.address], [100]);
    await founderSplitter.waitForDeployment();
    console.log("FounderSplitter deployed to:", founderSplitter.target);

    // 8. Deploy Seed Project Escrow (Proof of Concept)
    // Args: id, title, cat, country, region, executor, token, owner, repRegistry, amounts, descs
    const Escrow = await hre.ethers.getContractFactory("ProjectEscrow");
    const seedEscrow = await Escrow.deploy(
        "SEED_001", "Genesis Project", "Agri-Tech", "Nigeria", "Lagos",
        deployer.address, // executor (deployer for now)
        token.target,
        deployer.address, // owner
        reputationRegistry.target, // ReputationRegistry added
        [hre.ethers.parseEther("100")],
        ["Genesis Milestone"]
    );
    await seedEscrow.waitForDeployment();
    console.log("ProjectEscrow (Seed) deployed to:", seedEscrow.target);

    // Authorize Seed Escrow manually since it wasn't created by Factory
    await (await reputationRegistry.grantAutomationRole(seedEscrow.target)).wait();

    // 9. Setup Roles & Transfers (Existing logic shifted down)
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

    // Grant Governor Proposer Role
    await (await timelock.grantRole(PROPOSER_ROLE, governor.target)).wait();
    console.log("Granted Proposer Role to Governor");

    // Grant Executor Role to 'Zero Address' (Open Execution) or Deployer for testing
    // Keeping deployer as executor for now to make scripts easy

    // 10. Fund the Sale Contract
    // Transfer 100 Million TRS to Sale contract for the public round
    const saleAmount = hre.ethers.parseEther("100000000"); // 100M
    await (await token.transfer(sale.target, saleAmount)).wait();
    console.log("Transferred 100M TRS to Sale Limit");

    // 11. Start the Sale
    await (await sale.startSale()).wait();
    console.log("Sale master switch turned ON");

    // 12. Register Seed Project & Verify Deployer (Transparency Hook)
    // 12a. Verify Deployer
    await (await registry.setVerified(deployer.address, true)).wait();
    console.log("Verified Deployer as Executor");

    // 12b. Register the Seed Escrow
    await (await registry.registerProject(seedEscrow.target, "Genesis Agri-Tech")).wait();
    console.log("Registered Seed Project in ExecutionRegistry");

    // --- 13. Opportunity Registry (Intelligence Vault) ---
    console.log("Deploying OpportunityRegistry...");
    const OpportunityRegistry = await hre.ethers.getContractFactory("OpportunityRegistry");
    const vault = await OpportunityRegistry.deploy();
    await vault.waitForDeployment();
    console.log(`OpportunityRegistry deployed to: ${vault.target}`);

    // 14. Transfer Remaining Supply to Timelock (Treasury)
    // The rest (900M) goes to the secure Treasury
    // We keep 100,000 TRS for the Deployer to ensure we have voting power and can seed test users
    const remainingSupply = await token.balanceOf(deployer.address);
    const keepAmount = hre.ethers.parseEther("100000");

    if (remainingSupply > keepAmount) {
        const sendAmount = remainingSupply - keepAmount;
        await (await token.transfer(timelock.target, sendAmount)).wait();
        console.log(`Transferred ${hre.ethers.formatEther(sendAmount)} TRS to Timelock (Kept 1000 for Operations)`);
    } else {
        console.log("Deployer balance too low to transfer remaining to Timelock");
    }

    // 16. Transfer Ownerships to Timelock (Final Decentralization Step)
    console.log("\nTransferring Ownerships to Timelock...");
    await (await token.transferOwnership(timelock.target)).wait();
    await (await sale.transferOwnership(timelock.target)).wait();
    await (await registry.transferOwnership(timelock.target)).wait(); // ExecutionRegistry
    // Factory and ReputationRegistry should also be owned by Timelock? Yes.
    // ProjectFactory is immutable and not Ownable, so skipping ownership transfer.
    // await (await factory.transferOwnership(timelock.target)).wait(); 
    await (await reputationRegistry.transferOwnership(timelock.target)).wait(); // Reputation
    await (await policyRegistry.transferOwnership(timelock.target)).wait(); // Policy

    console.log("CRITICAL: Token, Sale, and Registry Ownership transferred to Timelock.");

    // 15. Check Timelock Balance
    // console.log("Timelock Balance:", await token.balanceOf(timelock.target));

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log("Update frontend/lib/contracts.ts with these:");
    console.log({
        TOKEN: token.target,
        TIMELOCK: timelock.target,
        GOVERNOR: governor.target,
        SALE: sale.target,
        REGISTRY: registry.target,
        FACTORY: factory.target,
        REPUTATION: reputationRegistry.target,
        POLICY: policyRegistry.target,
        VAULT: vault.target,
        DIVIDEND: dividendVault.target,
        SPLITTER: founderSplitter.target,
        SEED: seedEscrow.target
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
