const hre = require("hardhat");
// Fixed import error
// Better to just hardcode or import from a JS file.
// I'll hardcode or read artifacts.

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Checking verification for:", deployer.address);

    const REGISTRY_ADDR = "0xFD3791619881ec944Ab7080e84A9C818b2c59A1B";
    // Note: I should double check this address from my previous "contracts.ts" read.
    // In step 2155 contracts.ts had PROJECT_REGISTRY: "0xFD37..."

    const Registry = await hre.ethers.getContractAt("ExecutionRegistry", REGISTRY_ADDR);
    const isVerified = await Registry.isVerified(deployer.address);

    console.log(`Is Verified? ${isVerified}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
