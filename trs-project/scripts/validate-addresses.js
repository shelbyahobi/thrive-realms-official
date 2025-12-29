const { ethers } = require("ethers");

const addresses = {
    TOKEN: "0xF4B88C28852D7332AdF4939C1082e027cFA1CF29",
    TIMELOCK: "0x78A7ad1625F565A33d9e58bB63bF19769E7591c3",
    GOVERNOR: "0xA4aDb8bF661806d00Ad5F23662f86D7796f325BD",
    SALE: "0x2452065278a34Dc98F64Cd459F680B6C1458DD27",
    PROJECT_REGISTRY: "0x7cC186dd99F2021C69C8EF390dFAFa7aD4c4e999",
    VAULT: "0x1dE8CFf01bacAFF8145c2E1907A4239224E4E493",
    DIVIDEND_VAULT: "0x886bE8509894e2563a7463eFCb4766a516cb7d2B",
    FOUNDER_SPLITTER: "0x6BEda4683e206e1b62958ed1Ffab663B374bAb5C",
    SEED_ESCROW: "0xb1C65Ef73145CE592B117F25872e9798E4Ec8014"
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
