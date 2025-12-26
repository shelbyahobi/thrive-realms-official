const hre = require("hardhat");

async function main() {
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";

    // Config
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying DividendVault with account:", deployer.address);

    const DividendVault = await hre.ethers.getContractFactory("DividendVault");
    const vault = await DividendVault.deploy(TOKEN_ADDRESS);
    await vault.waitForDeployment();
    console.log("DividendVault deployed to:", vault.target);

    console.log("\nUpdate lib/contracts.ts:");
    console.log(`    DIVIDEND_VAULT: "${vault.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
