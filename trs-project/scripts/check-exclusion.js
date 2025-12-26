const hre = require("hardhat");

const TOKEN_ADDR = "0x9D4C2d67C049595da7Fd09aF94218A843cfA6d01";

async function main() {
    const [signer] = await hre.ethers.getSigners();
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    const isExcluded = await token.isExcludedFromMaxWallet(signer.address);
    const maxWallet = await token.MAX_WALLET();

    console.log("User:", signer.address);
    console.log("Is Excluded:", isExcluded);
    console.log("MAX_WALLET:", hre.ethers.formatEther(maxWallet));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
