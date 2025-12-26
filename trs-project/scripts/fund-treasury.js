const hre = require("hardhat");

async function main() {
    const TIMELOCK = "0x44e5e324B4BBe790F44891e53Eb32Cb362ab7714";
    const [deployer] = await hre.ethers.getSigners();

    console.log("Funding Treasury (Timelock) from Deployer...");
    console.log("Deployer Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

    // Send 0.1 BNB to Timelock to simulate revenue
    const tx = await deployer.sendTransaction({
        to: TIMELOCK,
        value: hre.ethers.parseEther("0.1")
    });

    console.log("Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Treasury Funded! Dashboard should now show 0.1 BNB.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
