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

    // 2. Deploy Timelock (minDelay = 0 for dev)
    const Timelock = await hre.ethers.getContractFactory("TRSTimelock");
    const minDelay = 0;
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
    const governor = await Governor.deploy(
        token.target,
        timelock.target,
        1,  // 1 block delay
        20, // ~1 min period for testing
        0,  // 0 threshold
        4   // 4% quorum
    );
    await governor.waitForDeployment();
    console.log("TRSGovernor deployed to:", governor.target);

    // 4. Create Sale
    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = await Sale.deploy(token.target, timelock.target);
    await sale.waitForDeployment();
    console.log("TRSSale deployed to:", sale.target);

    // 5. Deploy Registry
    const Registry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();
    console.log("ExecutionRegistry deployed to:", registry.target);

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
    // Args: id, title, cat, country, region, executor, token, owner, amounts, descs
    const Escrow = await hre.ethers.getContractFactory("ProjectEscrow");
    const seedEscrow = await Escrow.deploy(
        "SEED_001", "Genesis Project", "Agri-Tech", "Nigeria", "Lagos",
        deployer.address, // executor (deployer for now)
        token.target,
        deployer.address, // owner
        [hre.ethers.parseEther("100")], // 1 milestone of 100 TRS
        ["Genesis Milestone"]
    );
    await seedEscrow.waitForDeployment();
    console.log("ProjectEscrow (Seed) deployed to:", seedEscrow.target);

    // 9. Setup Roles & Transfers (Existing logic shifted down)
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

    // Grant Governor Proposer Role
    await (await timelock.grantRole(PROPOSER_ROLE, governor.target)).wait();
    console.log("Granted Proposer Role to Governor");

    // Grant Executor Role to 'Zero Address' (Open Execution) or Deployer for testing
    // Keeping deployer as executor for now to make scripts easy

    // 7. Fund the Sale Contract
    // Transfer 100 Million TRS to Sale contract for the public round
    const saleAmount = hre.ethers.parseEther("100000000"); // 100M
    await (await token.transfer(sale.target, saleAmount)).wait();
    console.log("Transferred 100M TRS to Sale Limit");

    // 8. Start the Sale
    await (await sale.startSale()).wait();
    console.log("Sale master switch turned ON");

    // 9. Register Seed Project & Verify Deployer (Transparency Hook)
    // 9a. Verify Deployer
    await (await registry.setVerified(deployer.address, true)).wait();
    console.log("Verified Deployer as Executor");

    // 9b. Register the Seed Escrow
    await (await registry.registerProject(seedEscrow.target, "Genesis Agri-Tech")).wait();
    console.log("Registered Seed Project in ExecutionRegistry");

    // 9. Transfer Remaining Supply to Timelock (Treasury)
    // The rest (900M) goes to the secure Treasury
    const remainingSupply = await token.balanceOf(deployer.address);
    if (remainingSupply > 0) {
        await (await token.transfer(timelock.target, remainingSupply)).wait();
        console.log(`Transferred remaining ${hre.ethers.formatEther(remainingSupply)} TRS to Timelock`);
    }

    // 10. Grant Roles (Simplified)
    await (await timelock.grantRole(PROPOSER_ROLE, governor.target)).wait();
    console.log("Granted Proposer Role to Governor");

    console.log("\n--- DEPLOYMENT COMPLETE ---");
    console.log("Update frontend/lib/contracts.ts with these:");
    console.log({
        TOKEN: token.target,
        TIMELOCK: timelock.target,
        GOVERNOR: governor.target,
        SALE: sale.target,
        REGISTRY: registry.target
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
