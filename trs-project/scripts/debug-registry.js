const hre = require("hardhat");

// Addresses from contracts.ts
const CONTRACT_ADDRESSES = {
    TOKEN: "0x9D4C2d67C049595da7Fd09aF94218A843cfA6d01",
    COMPANY_REGISTRY: "0x3E003357a2a53552f1811cB645a1a4C7ABFF1D4A"
};

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Debugging with account:", signer.address);

    // 1. Check Company Registry Config
    const registry = await hre.ethers.getContractAt("CompanyRegistry", CONTRACT_ADDRESSES.COMPANY_REGISTRY);
    const tokenAddrOnRegistry = await registry.token();
    const minStake = await registry.minStakeRequirement();

    console.log("--- Configuration ---");
    console.log("Registry Address:", CONTRACT_ADDRESSES.COMPANY_REGISTRY);
    console.log("Registry expects Token:", tokenAddrOnRegistry);
    console.log("Frontend expects Token:", CONTRACT_ADDRESSES.TOKEN);
    console.log("Min Stake Requirement:", hre.ethers.formatEther(minStake), "TRS");

    if (tokenAddrOnRegistry.toLowerCase() !== CONTRACT_ADDRESSES.TOKEN.toLowerCase()) {
        console.log("❌ MISMATCH DETECTED! Contract uses a different token than Frontend.");
    } else {
        console.log("✅ Config Match");
    }

    // 2. Check Balances
    const tokenContract = await hre.ethers.getContractAt("TRSToken", CONTRACT_ADDRESSES.TOKEN);
    const balance = await tokenContract.balanceOf(signer.address); // Check deployer/user balance
    console.log("--- Balances ---");
    console.log(`User Balance on Frontend Token (${CONTRACT_ADDRESSES.TOKEN}):`, hre.ethers.formatEther(balance));

    if (tokenAddrOnRegistry.toLowerCase() !== CONTRACT_ADDRESSES.TOKEN.toLowerCase()) {
        const otherToken = await hre.ethers.getContractAt("TRSToken", tokenAddrOnRegistry);
        const otherBal = await otherToken.balanceOf(signer.address);
        console.log(`User Balance on Registry Token (${tokenAddrOnRegistry}):`, hre.ethers.formatEther(otherBal));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
