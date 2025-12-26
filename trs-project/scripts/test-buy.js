const hre = require("hardhat");

async function main() {
    const SALE_ADDR = "0xdB7360EA5c15e8e68b6bb19d172d300fcC0Fe0a6";
    const [buyer] = await hre.ethers.getSigners();

    console.log("Attempting purchase with account:", buyer.address);
    const sale = await hre.ethers.getContractAt("TRSSale", SALE_ADDR);

    // Check Price
    const price = await sale.getCurrentPrice();
    console.log("Current Price:", hre.ethers.formatEther(price), "BNB");

    // Amount to buy: 0.0001 BNB (Should be small enough)
    const buyVal = hre.ethers.parseEther("0.0001");

    console.log("Sending:", hre.ethers.formatEther(buyVal), "BNB");

    try {
        const tx = await sale.connect(buyer).buyTokens({ value: buyVal });
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Purchase Successful!");
    } catch (e) {
        console.error("Purchase Failed!");
        console.error(e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
