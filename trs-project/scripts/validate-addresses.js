const { ethers } = require("ethers");

const addresses = {
    TOKEN: "0xA0Ec16d810D69Fb68975a0b5aE4e7A88e3a0771E",
    TIMELOCK: "0x9D05b3711121B0F5cc2D053d584c0bEd52d56460",
    GOVERNOR: "0x036B3CfED7c37A10bAB1808cb9471a242549dd73",
    SALE: "0xf0AEBD2835f48c7b9cAB07ab5e83e9Bc1558F8A7",
    PROJECT_REGISTRY: "0x40c884d3072e3104E3bcb6382ed9aD90CB712AF4",
    DIVIDEND_VAULT: "0x9dC4e6Ce87b9c5D8fCa9e13E36ABf3bFcFD35Af1",
    FOUNDER_SPLITTER: "0x2757EEe5B4e28d6CD8A74d7a32b58B12A6691F84",
    SEED_ESCROW: "0x55C4a6732f5f513752C49E5589f68FFc39424A4d"
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
