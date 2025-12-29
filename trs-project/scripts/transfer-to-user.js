const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    // Recovered Address from debug script
    const USER_ADDRESS = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";

    // TRSToken from new deployment
    const TRSTokenAddress = "0x2cEA540eDe529bf794C5555061CE963517d11DdA";

    console.log("Transferring tokens...");
    console.log("From (Deployer):", deployer.address);
    console.log("To (User):", USER_ADDRESS);

    const Token = await hre.ethers.getContractFactory("TRSToken");
    const token = Token.attach(TRSTokenAddress);

    const amount = hre.ethers.parseEther("25000"); // Sending 25,000 to meet 24k Threshold
    const tx = await token.transfer(USER_ADDRESS, amount);
    await tx.wait();

    console.log("Transfer Complete!");
    console.log("User Balance:", hre.ethers.formatEther(await token.balanceOf(USER_ADDRESS)));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
