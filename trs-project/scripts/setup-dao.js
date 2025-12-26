const hre = require("hardhat");

async function main() {
    // New Addresses from Redeployment (Structured Governance)
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const SALE_ADDRESS = "0xdB7360EA5c15e8e68b6bb19d172d300fcC0Fe0a6";
    const TIMELOCK_ADDRESS = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";

    const Token = await hre.ethers.getContractFactory("TRSToken");
    const token = Token.attach(TOKEN_ADDRESS);

    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = Sale.attach(SALE_ADDRESS);

    const Timelock = await hre.ethers.getContractFactory("TRSTimelock");
    const timelock = Timelock.attach(TIMELOCK_ADDRESS);

    const [deployer] = await hre.ethers.getSigners();
    console.log("Setting up DAO with account:", deployer.address);

    // 0. Ensure Deployer has Roles to Schedule/Execute
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();

    if (!await timelock.hasRole(PROPOSER_ROLE, deployer.address)) {
        console.log("Granting PROPOSER_ROLE to self...");
        await (await timelock.grantRole(PROPOSER_ROLE, deployer.address)).wait();
    }
    if (!await timelock.hasRole(EXECUTOR_ROLE, deployer.address)) {
        console.log("Granting EXECUTOR_ROLE to self...");
        await (await timelock.grantRole(EXECUTOR_ROLE, deployer.address)).wait();
    }

    // 1. Approve Sale Contract
    console.log("Scheduling Approval...");
    const maxUint = hre.ethers.MaxUint256;
    const approveData = token.interface.encodeFunctionData("approve", [SALE_ADDRESS, maxUint]);

    const salt = hre.ethers.id("setup_sale_approval_v4");
    const delay = 0;

    try {
        const tx = await timelock.schedule(TOKEN_ADDRESS, 0, approveData, hre.ethers.ZeroHash, salt, delay);
        await tx.wait();
        console.log("Approval Scheduled");
    } catch (e) {
        console.log("Schedule Error (might be duplicate):", e.message);
    }

    // Execute
    try {
        const txExec = await timelock.execute(TOKEN_ADDRESS, 0, approveData, hre.ethers.ZeroHash, salt);
        await txExec.wait();
        console.log("Approval Executed! Sale is Live.");
    } catch (e) {
        console.log("Execute Error:", e.message);
    }

    // 2. Transfer Ownership to Timelock
    if ((await token.owner()) === deployer.address) {
        await (await token.transferOwnership(TIMELOCK_ADDRESS)).wait();
    }
    if ((await sale.owner()) === deployer.address) {
        await (await sale.transferOwnership(TIMELOCK_ADDRESS)).wait();
    }

    console.log("DAO Setup Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
