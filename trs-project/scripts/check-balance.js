const hre = require("hardhat");

async function main() {
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";
    const USER_ADDR = "0x07d3cc2f780fee6969814e53441cb27054e39e4b"; // Address from error log

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    console.log("Checking balance for:", USER_ADDR);

    // Check BNB Balance
    const bnbBal = await hre.ethers.provider.getBalance(USER_ADDR);
    console.log("BNB Balance:", hre.ethers.formatEther(bnbBal));

    const bal = await token.balanceOf(USER_ADDR);
    console.log("TRS Balance:", hre.ethers.formatEther(bal));

    if (bal >= hre.ethers.parseEther("47999")) {
        console.log("⚠️  User has reached the Anti-Whale Cap!");
    } else {
        console.log("✅ User is below the Anti-Whale cap.");
    }

    if (bnbBal < hre.ethers.parseEther("0.01")) { // Check for bare minimum
        console.log("⚠️  CRITICAL: User has practically 0 BNB!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
