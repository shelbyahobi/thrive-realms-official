const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const USER_ADDRESS = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";

    // Contracts
    const SALE_ADDRESS = "0x72F534A7dB15947F351eFc35b2D1e979D1156F81";
    const TOKEN_ADDRESS = "0x2cEA540eDe529bf794C5555061CE963517d11DdA";

    const Sale = await hre.ethers.getContractFactory("TRSSale");
    const sale = Sale.attach(SALE_ADDRESS);
    const Token = await hre.ethers.getContractFactory("TRSToken");
    const token = Token.attach(TOKEN_ADDRESS);

    // 1. Buy 26,000 TRS (Extra buffer)
    // Price ~ 0.00001 BNB. 26,000 * 0.00001 = 0.26 BNB.
    // Sending 0.3 BNB to be safe.
    console.log("Buying 26,000 TRS...");

    const buyTx = await sale.connect(deployer).buyTokens({ value: hre.ethers.parseEther("0.3") });
    await buyTx.wait();

    const balance = await token.balanceOf(deployer.address);
    console.log("Deployer Balance after buy:", hre.ethers.formatEther(balance));

    // 2. Transfer to User
    console.log("Transferring 25,000 TRS to User...");
    const transferTx = await token.transfer(USER_ADDRESS, hre.ethers.parseEther("25000"));
    await transferTx.wait();

    console.log("Transfer Complete!");
    console.log("User Balance:", hre.ethers.formatEther(await token.balanceOf(USER_ADDRESS)));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
