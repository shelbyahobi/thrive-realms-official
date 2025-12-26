const hre = require("hardhat");

async function main() {
    // UPDATED SECURE ADDRESSES
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";
    const SALE_ADDR = "0x23A6c257Ee4cBf93727F3A2F6D26DeC58dC33aF9";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Fixing allowance with account:", deployer.address);

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // Check current allowance
    const currentAllowance = await token.allowance(deployer.address, SALE_ADDR);
    console.log("Current Allowance:", hre.ethers.formatEther(currentAllowance));

    if (currentAllowance > 0n) {
        console.log("Allowance already set. Re-approving just in case...");
    }

    // Approve Max Uint
    const tx = await token.approve(SALE_ADDR, hre.ethers.MaxUint256);
    console.log("Approval Tx sent:", tx.hash);
    await tx.wait();

    console.log("✅ Allowance Fixed! Sale contract can now transfer tokens.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
