const hre = require("hardhat");

async function main() {
    // TARGET USER WALLET
    const USER_ADDRESS = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";

    // Addresses from latest deployment
    const TOKEN_ADDR = "0x65a94C08f4c00B00F1F544D046e9997C7DA2c398";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Using Deployer Account:", deployer.address);

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // Check Deployer Balance
    const deployerBal = await token.balanceOf(deployer.address);
    console.log(`Deployer Balance: ${hre.ethers.formatEther(deployerBal)} TRS`);

    if (deployerBal < hre.ethers.parseEther("1000")) {
        console.error("❌ Deployer has insufficient funds to seed user.");
        return;
    }

    // Transfer 1,000 TRS to User (Enough for Proposal + Voting)
    const amount = hre.ethers.parseEther("1000");
    console.log(`Transferring 1,000 TRS to ${USER_ADDRESS}...`);

    const tx = await token.transfer(USER_ADDRESS, amount);
    await tx.wait();

    console.log("✅ Transfer Complete!");
    console.log(`Tx Hash: ${tx.hash}`);

    // Check User Balance
    const userBal = await token.balanceOf(USER_ADDRESS);
    console.log(`User New Balance: ${hre.ethers.formatEther(userBal)} TRS`);

    console.log("\nIMPORTANT NEXT STEPS FOR USER:");
    console.log("1. Go to https://thrive-realms-official.vercel.app/governance");
    console.log("2. Connect Wallet: " + USER_ADDRESS);
    console.log("3. Click 'Delegate to Self' (Required to activate voting power)");
    console.log("4. Create Proposal (Threshold is 100 TRS, you have 1,000)");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
