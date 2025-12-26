const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // Use proper checksum address or safe conversion
    const USER_ADDRESS = ethers.getAddress("0x07D3cc2f780fEe6969814E53441cb27054c39E4b");

    // Contract Addr from frontend/lib/contracts.ts
    const TOKEN_ADDRESS = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";

    console.log("--- Funding User for Quorum ---");
    console.log("Deployer:", deployer.address);
    console.log("Target:", USER_ADDRESS);

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDRESS);

    // 1. Check Deployer Balance
    const bal = await token.balanceOf(deployer.address);
    console.log(`Deployer Token Balance: ${hre.ethers.formatEther(bal)} TRS`);

    if (bal < hre.ethers.parseEther("20000000")) {
        console.error("Deployer doesn't have enough tokens!");
        return;
    }

    // 2. Transfer 20 Million TRS to User (Quorum is 10M)
    const AMOUNT = hre.ethers.parseEther("20000000"); // 20M
    console.log("Transferring 20,000,000 TRS...");

    const tx = await token.transfer(USER_ADDRESS, AMOUNT);
    await tx.wait();
    console.log(`Transfer Success! Tx: ${tx.hash}`);

    // 3. User MUST Delegate to activate them
    console.log("IMPORTANT: User must DELEGATE to themselves again to count these new votes!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
