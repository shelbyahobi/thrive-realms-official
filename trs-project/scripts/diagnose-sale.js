const hre = require("hardhat");

async function main() {
    // Addresses from frontend/lib/contracts.ts (Updated for Secure Deployment)
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";
    const SALE_ADDR = "0x23A6c257Ee4cBf93727F3A2F6D26DeC58dC33aF9";
    const TIMELOCK_ADDR = "0x44e5e324B4BBe790F44891e53Eb32Cb362ab7714";

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
    // 3. Check Funding (Direct Funding Model)
    // Sale needs to HOLD tokens to sell them (transfer(msg.sender, amount))
    if (saleBal === 0n) {
        console.error("\nCRITICAL ISSUE: The Sale contract has 0 TRS Balance.");
        console.error("The 'buyTokens' function uses transfer(msg.sender, amount).");
        console.error("You MUST fund the Sale contract directly from the Treasury.");
    } else {
        console.log("\nFunding looks OK. Sale contract has tokens.");
    }

    // Allowance check is NOT needed for this model, but we check if it exists just in case
    const allowance = await token.allowance(TIMELOCK_ADDR, SALE_ADDR);
    if (allowance > 0n) {
        console.log("Note: Treasury has also approved Sale contract (Allowance: " + hre.ethers.formatEther(allowance) + "), but this model uses Direct Balance.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
