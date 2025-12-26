const hre = require("hardhat");

async function main() {
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";
    const USER_ADDR = "0x07d3cc2f780fee6969814e53441cb27054e39e4b";

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    console.log("Checking Voting Power for:", USER_ADDR);

    const bal = await token.balanceOf(USER_ADDR);
    const votes = await token.getVotes(USER_ADDR);
    const delegates = await token.delegates(USER_ADDR); // Check who they are delegated to

    console.log("-------------------------------------------------");
    console.log("TRS Balance:    ", hre.ethers.formatEther(bal));
    console.log("Voting Power:   ", hre.ethers.formatEther(votes));
    console.log("Delegated To:   ", delegates);
    console.log("-------------------------------------------------");

    if (bal > 0n && votes === 0n) {
        console.log("⚠️  ISSUE DETECTED: You have tokens but ZERO voting power.");
        console.log("✅  SOLUTION: You must DELEGATE to yourself.");
    } else if (votes >= hr.ethers.parseEther("24000")) {
        console.log("✅  You have enough voting power to propose!");
    } else {
        console.log("ℹ️  Status OK (or simply not enough tokens).");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
