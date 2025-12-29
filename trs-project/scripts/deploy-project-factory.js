const hre = require("hardhat");

async function main() {
    console.log("Deploying ProjectFactory...");

    const REGISTRY_ADDRESS = "0xFD3791619881ec944Ab7080e84A9C818b2c59A1B"; // Deployed Phase 1 Registry
    console.log("Deploying ProjectFactory with Registry:", REGISTRY_ADDRESS);

    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy(REGISTRY_ADDRESS);

    await factory.waitForDeployment();

    console.log("ProjectFactory deployed to:", factory.target);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
