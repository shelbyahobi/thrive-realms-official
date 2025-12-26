const hre = require("hardhat");

async function main() {
    const TOKEN = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const [signer] = await hre.ethers.getSigners();

    console.log("Checking owner of TRSToken...");
    const TRSToken = await hre.ethers.getContractFactory("TRSToken");
    const token = TRSToken.attach(TOKEN);

    const owner = await token.owner();
    console.log("Token Owner:", owner);
    console.log("Deployer:   ", signer.address);

    if (owner === signer.address) {
        console.log("SUCCESS: Deployer is Owner. You can call snapshot() directly.");
    } else {
        console.log("WARNING: Deployer is NOT Owner. You probably need a DAO Proposal.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
