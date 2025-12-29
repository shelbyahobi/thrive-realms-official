const hre = require("hardhat");

const SALE_ADDRESS = "0x2452065278a34Dc98F64Cd459F680B6C1458DD27";

async function main() {
    console.log("Checking Sale Status at:", SALE_ADDRESS);
    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = Sale.attach(SALE_ADDRESS);

    try {
        const started = await sale.saleStarted();
        console.log("Sale Started:", started);

        const ended = await sale.saleEnded();
        console.log("Sale Ended:", ended);

        const price = await sale.getCurrentPrice();
        console.log("Current Price (Wei):", price.toString());
        console.log("Current Price (BNB):", hre.ethers.formatEther(price));

        const initial = await sale.INITIAL_PRICE();
        console.log("Initial Price config:", hre.ethers.formatEther(initial));

    } catch (e) {
        console.error("Error reading contract:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
