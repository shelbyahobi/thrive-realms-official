const hre = require("hardhat");

async function main() {
    const TIMELOCK = "0x44e5e324B4BBe790F44891e53Eb32Cb362ab7714";
    const SALE = "0x23A6c257Ee4cBf93727F3A2F6D26DeC58dC33aF9";
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";

    console.log("--- Treasury Diagnostics ---");

    // Check Timelock BNB
    const timelockBal = await hre.ethers.provider.getBalance(TIMELOCK);
    console.log(`Timelock BNB: ${hre.ethers.formatEther(timelockBal)} BNB`);

    // Check Sale BNB (Should be 0 if forwarding works)
    const saleBal = await hre.ethers.provider.getBalance(SALE);
    console.log(`Sale Contract BNB: ${hre.ethers.formatEther(saleBal)} BNB`);

    // Check Token Balances
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    const timelockTrs = await token.balanceOf(TIMELOCK);
    console.log(`Timelock TRS: ${hre.ethers.formatEther(timelockTrs)} TRS`);

    const saleTrs = await token.balanceOf(SALE);
    console.log(`Sale Contract TRS: ${hre.ethers.formatEther(saleTrs)} TRS`);

    if (saleBal > 0n) {
        console.log("⚠️  ISSUE: BNB is stuck in Sale Contract! Forwarding failed?");
    }
    if (timelockBal === 0n && saleBal === 0n) {
        console.log("⚠️  ISSUE: No BNB found in either contract. Did you actually buy?");
    } else {
        console.log("✅ Funds located.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
