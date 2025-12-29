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

    // 7. Transfer Token Supply to Timelock (Treasury)
    // The Sale contract pulls from the Treasury via allowance, OR we send to Sale directly?
    // Based on previous convos, Timelock holds funds.
    const totalSupply = await token.totalSupply();
    await (await token.transfer(timelock.target, totalSupply)).wait();
    console.log("Transferred 1B TRS to Timelock");

    // 8. Approve Sale to spend Timelock funds
    // Since Timelock is the holder, it must approve the Sale contract.
    // deployer needs to schedule this via Timelock since deployer has PROPOSER_ROLE
    const maxUint = hre.ethers.MaxUint256;
    const approveData = token.interface.encodeFunctionData("approve", [sale.target, maxUint]);

    // Execute immediately (delay 0)
    await (await timelock.schedule(token.target, 0, approveData, hre.ethers.ZeroHash, hre.ethers.id("setup_sale"), 0)).wait();
    await (await timelock.execute(token.target, 0, approveData, hre.ethers.ZeroHash, hre.ethers.id("setup_sale"))).wait();
    console.log("Approved Sale contract to spend Treasury funds");

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
