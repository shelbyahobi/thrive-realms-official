const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying ProjectRegistry with account:", deployer.address);

    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const registry = await ProjectRegistry.deploy();
    await registry.waitForDeployment();
    console.log("ProjectRegistry deployed to:", registry.target);

    console.log("\nUpdate lib/contracts.ts:");
    console.log(`    PROJECT_REGISTRY: "${registry.target}",`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
