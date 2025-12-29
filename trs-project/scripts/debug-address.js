const hre = require("hardhat");

const ADDRESSES = {
    TOKEN: "0x2cea540ede529bf794c5555061ce963517d11dda",
    PROJECT_FACTORY: "0xb934522cc75c0245226d132d93922b487b2e576f",
    POLICY_REGISTRY: "0x94cfb7115857245b7803a0e8246e72f5015b601b",
    EXECUTION_REGISTRY: "0xfd3791619881ec944ab7080e84a9c818b2c59a1b"
};

async function main() {
    console.log("Checking Code...");
    for (const [name, addr] of Object.entries(ADDRESSES)) {
        const code = await hre.ethers.provider.getCode(addr);
        const size = (code.length - 2) / 2;
        console.log(`${name} (${addr}): ${size} bytes`);
    }
}

main().catch(console.error);
