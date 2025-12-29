const { ethers } = require("ethers");

const addresses = {
    TOKEN: "0xDd719fDe6f093b58242fa58E1207B57A3FEd714D",
    TIMELOCK: "0xeccf3fCbA5e11b7AaaC0340317c95305695dc02d",
    GOVERNOR: "0x99f7533591657be105636C82CdD8249549381d5D",
    SALE: "0xBd0D77CD1A020a105bD9F0d12d44da229f09000B",
    PROJECT_REGISTRY: "0x1b2e349A06191CF3c0dA1850B94C78894E27d705",
    DIVIDEND_VAULT: "0x4643724F003b0B9aFE5E9e056A345968842EC81A",
    FOUNDER_SPLITTER: "0xf15B9072447B7882af99eE618ca554A605B45f54",
    SEED_ESCROW: "0x89C735f6A8D195AA3293AA37aA2B6667a17c78Be"
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
