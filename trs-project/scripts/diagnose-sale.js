const hre = require("hardhat");

async function main() {
    // Addresses from frontend/lib/contracts.ts
    const TOKEN_ADDR = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const SALE_ADDR = "0xdB7360EA5c15e8e68b6bb19d172d300fcC0Fe0a6";
    const TIMELOCK_ADDR = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Diagnosing with account:", deployer.address);

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);
    const sale = await hre.ethers.getContractAt("TRSSale", SALE_ADDR);

    // 1. Check Configuration
    const treasuryInSale = await sale.treasury();
    console.log("\n--- Configuration ---");
    console.log("Sale Contract thinks Treasury is:", treasuryInSale);
    console.log("Actual Timelock Address:         ", TIMELOCK_ADDR);

    if (treasuryInSale.toLowerCase() !== TIMELOCK_ADDR.toLowerCase()) {
        console.error("MISMATCH! Sale is trying to pull from wrong address.");
    }

    // 2. Check Balances
    const timelockBal = await token.balanceOf(TIMELOCK_ADDR);
    const deployerBal = await token.balanceOf(deployer.address);
    const saleBal = await token.balanceOf(SALE_ADDR);

    console.log("\n--- Balances ---");
    console.log("Timelock (Treasury) Balance:", hre.ethers.formatEther(timelockBal), "TRS");
    console.log("Deployer Balance:           ", hre.ethers.formatEther(deployerBal), "TRS");
    console.log("Sale Contract Balance:      ", hre.ethers.formatEther(saleBal), "TRS");

    // 3. Check Allowance
    // Sale needs allowance from Treasury to move funds (transferFrom)
    const allowance = await token.allowance(TIMELOCK_ADDR, SALE_ADDR);
    console.log("\n--- Allowances ---");
    console.log("Allowance (Timelock -> Sale):", hre.ethers.formatEther(allowance), "TRS");

    if (allowance === 0n) {
        console.error("\nCRITICAL ISSUE: The Sale contract has 0 allowance from the Treasury.");
        console.error("The 'buyTokens' function uses transferFrom(treasury, buyer).");
        console.error("It will FAIL until the Treasury approves the Sale contract.");
    } else {
        console.log("\nAllowance looks OK.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
