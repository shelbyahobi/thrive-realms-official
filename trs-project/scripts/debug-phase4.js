const hre = require("hardhat");

const ADDRESSES = {
    REVENUE_ROUTER: "0x7a83d46a8d534440c9d7496c4e410b2fb817a0a6",
    EXECUTION_REGISTRY: "0x7007ef4541cb482834b998d5b2a0db49c40de96d",
    DIVIDEND_VAULT: "0xafc3066e0f81155989f971271110090886ced573"
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
