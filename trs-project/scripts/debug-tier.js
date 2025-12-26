const hre = require("hardhat");

async function main() {
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    const TRS = await hre.ethers.getContractAt("TRSToken", contractAddress);

    const [signer] = await hre.ethers.getSigners();
    console.log("Calling getTier with address:", signer.address);

    try {
        const tier = await TRS.getTier(signer.address);
        console.log("Tier Result:", tier);
    } catch (error) {
        console.error("Error calling getTier:", error);
    }

    // Also check decimals just in case
    try {
        const decimals = await TRS.decimals();
        console.log("Decimals:", decimals);
    } catch (e) { console.log("Decimals failed"); }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
