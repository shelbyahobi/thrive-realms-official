const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    // Addresses from contracts.ts (Testnet V2.4)
    const REGISTRY_ADDRESS = "0xFD3791619881ec944Ab7080e84A9C818b2c59A1B";
    const TIMELOCK_ADDRESS = "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E";

    console.log("Transferring ExecutionRegistry Ownership...");
    console.log("Registry:", REGISTRY_ADDRESS);
    console.log("New Owner (Timelock):", TIMELOCK_ADDRESS);

    const Registry = await hre.ethers.getContractFactory("ExecutionRegistry");
    const registry = Registry.attach(REGISTRY_ADDRESS);

    const currentOwner = await registry.owner();
    console.log("Current Owner:", currentOwner);

    if (currentOwner.toLowerCase() === TIMELOCK_ADDRESS.toLowerCase()) {
        console.log("Already owned by Timelock.");
        return;
    }

    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
        console.log("ERROR: Deployer is not the owner. Cannot transfer.");
        return;
    }

    const tx = await registry.transferOwnership(TIMELOCK_ADDRESS);
    await tx.wait();

    console.log("Ownership Transferred Successfully!");
    console.log("New Owner:", await registry.owner());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
