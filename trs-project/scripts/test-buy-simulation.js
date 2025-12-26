const hre = require("hardhat");

async function main() {
    // SECURE ADDRESSES
    const SALE_ADDR = "0x23A6c257Ee4cBf93727F3A2F6D26DeC58dC33aF9";
    const TOKEN_ADDR = "0x7c95Ed07B1ef6b310380Cf546a2cffCB377ef5A0";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Create a fresh wallet to simulate a new user
    const randomWallet = hre.ethers.Wallet.createRandom();
    const user = randomWallet.connect(hre.ethers.provider);
    console.log("Simulated User:", user.address);

    // Fund the simulated user
    console.log("Funding simulated user with 0.3 BNB...");
    const txFund = await deployer.sendTransaction({
        to: user.address,
        value: hre.ethers.parseEther("0.3")
    });
    await txFund.wait();
    console.log("Funded.");

    const sale = await hre.ethers.getContractAt("TRSSale", SALE_ADDR);

    console.log("Attempting to buy 0.25 BNB worth of TRS...");
    try {
        // Explicitly setting gasLimit to match Frontend
        const txBuy = await sale.connect(user).buyTokens({
            value: hre.ethers.parseEther("0.25"),
            gasLimit: 800000
        });
        console.log("Transaction sent:", txBuy.hash);
        await txBuy.wait();
        console.log("✅ Purchase Successful!");
    } catch (e) {
        console.error("❌ Purchase Failed!");
        console.error(e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
