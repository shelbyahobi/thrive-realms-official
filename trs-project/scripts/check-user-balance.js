const hre = require("hardhat");

async function main() {
    const TOKEN_ADDR = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const USER_ADDR = "0x96Bca3b30F40A1B2934813e6E36dF1D29797806E"; // Address from error log

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);
    const balance = await token.balanceOf(USER_ADDR);

    console.log(`\nUser: ${USER_ADDR}`);
    console.log(`Balance: ${hre.ethers.formatEther(balance)} TRS`);

    if (balance === 0n) {
        console.log("--> This user holds NO tokens. The purchase transaction likely failed.");
    } else {
        console.log("--> User exists on-chain. The UI should be showing this.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
