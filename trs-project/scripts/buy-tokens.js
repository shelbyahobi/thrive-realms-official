const hre = require("hardhat");

async function main() {
    const [buyer] = await hre.ethers.getSigners();
    console.log("Buying tokens for:", buyer.address);

    // TRSSale Address from recent deployment
    const SALE_ADDRESS = "0x72F534A7dB15947F351eFc35b2D1e979D1156F81";
    const TRSTokenAddress = "0x2cEA540eDe529bf794C5555061CE963517d11DdA";

    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = Sale.attach(SALE_ADDRESS);

    console.log("Sale Address:", SALE_ADDRESS);

    // Buy for 0.001 BNB
    const buyAmount = hre.ethers.parseEther("0.001");
    console.log(`Sending ${hre.ethers.formatEther(buyAmount)} BNB to buy TRS...`);

    const tx = await sale.connect(buyer).buyTokens({ value: buyAmount });
    await tx.wait();

    console.log("Purchase complete!");

    // Check Balance
    const Token = await hre.ethers.getContractFactory("TRSToken");
    const token = Token.attach(TRSTokenAddress);
    const balance = await token.balanceOf(buyer.address);
    console.log("New TRS Balance:", hre.ethers.formatEther(balance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
