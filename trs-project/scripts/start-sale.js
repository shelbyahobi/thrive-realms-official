const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Starting Sale with account:", deployer.address);

    // Address from lib/contracts.ts
    const SALE_ADDRESS = "0x72F534A7dB15947F351eFc35b2D1e979D1156F81";

    const sale = await hre.ethers.getContractAt("TRSSale", SALE_ADDRESS);

    // Check status
    const started = await sale.saleStarted();
    console.log("Sale Started Status:", started);

    if (!started) {
        console.log("Starting sale...");
        const tx = await sale.startSale();
        await tx.wait();
        console.log("Sale successfully started!");
    } else {
        console.log("Sale was already started.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
