const { ethers } = require("ethers");

const addresses = {
    TOKEN: "0x9C9618d2859a868b43C8500557d5B05a5A83f114",
    TIMELOCK: "0x49F17Af4817e28f1fae76E6df022f3755309ae0B",
    GOVERNOR: "0x93D84DD8222E891eB1FDaBE8D01F03a873d6c5A1",
    SALE: "0x589473c644655321eD1F7825f47BEbed82Df5103",
    PROJECT_REGISTRY: "0x55fd96Fe808FBeaAeb5E388cD66d9A686f264036",
    VAULT: "0xD61552b05c611ba4e5aFDBBb34C8BA6BE58Eb829",
    DIVIDEND_VAULT: "0x15fb393f46E9c3425b13e1A7c63f4a0f84305809",
    FOUNDER_SPLITTER: "0x52B68Ba69ef3711ea8536DD557a546B86E6BE792",
    SEED_ESCROW: "0xfA65E33D7535b7fF5dE668B8d8C9E088Ed1151d9"
};

async function main() {
    console.log("Validating addresses...");
    for (const [key, addr] of Object.entries(addresses)) {
        try {
            // Fix: Lowercase first to strip bad checksum, then let ethers re-checksum it
            const checksummed = ethers.getAddress(addr.toLowerCase());
            console.log(`[FIXED] ${key}: ${checksummed}`);
        } catch (e) {
            console.error(`[INVALID] ${key}: ${addr} - ${e.message}`);
        }
    }
}

main().catch(console.error);
