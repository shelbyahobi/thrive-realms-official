const hre = require("hardhat");

async function main() {
    // User Address from screenshot
    const USER_ADDRESS = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";
    const REGISTRY_ADDR = "0xD86fbe75a334C27C13b839B8bC81AEECe1596D1D"; // From deploy logs

    const registry = await hre.ethers.getContractAt("ExecutionRegistry", REGISTRY_ADDR);

    console.log(`Checking profile for: ${USER_ADDRESS}`);

    // Check Profile
    const profile = await registry.getEntity(USER_ADDRESS);
    console.log("Profile Data:");
    console.log("- Name:", profile.name);
    console.log("- Type:", profile.entityType);
    console.log("- Verified:", profile.isVerified);
    console.log("- Jurisdiction:", profile.jurisdiction);

    // Check Events
    console.log("\nScanning for EntityVerified events...");
    const filter = registry.filters.EntityVerified(USER_ADDRESS);
    const events = await registry.queryFilter(filter, 0, "latest"); // Check all blocks for validation
    console.log(`Found ${events.length} verification events.`);
    events.forEach(e => {
        console.log(`- Block ${e.blockNumber}: Verified=${e.args[1]}`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
