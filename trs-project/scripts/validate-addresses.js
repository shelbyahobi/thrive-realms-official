const { ethers } = require("ethers");

const addresses = {
    TOKEN: "0x82dbDE45BfDB0E842417770851893A0429715783",
    TIMELOCK: "0xC653198033621453258593450e13719FE485295c",
    GOVERNOR: "0x334BC48d53C22F2633000df45F80145C893a74b3",
    SALE: "0x166e4a2eABd603a11E39df9E7bCDe7870a3F4506",
    PROJECT_REGISTRY: "0xc83141F1b5a5937402F0B9356b2D33967d1C2506",
    DIVIDEND_VAULT: "0x3B6dF71569424c5354F969019623C56Ee5e5F2a2",
    FOUNDER_SPLITTER: "0xD2ddeC1B591A8A95AB6eAcB4b00cC2969d893129",
    SEED_ESCROW: "0x08C2B52De52daD945F102c7A40f02B840237664C"
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
