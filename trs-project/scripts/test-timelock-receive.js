const hre = require("hardhat");

async function main() {
    const TIMELOCK_ADDR = "0xEE72dD156B33806169C5c23bF9588A7773c195F1"; // From contracts.ts
    const [sender] = await hre.ethers.getSigners();

    console.log("Testing BNB send to Timelock:", TIMELOCK_ADDR);

    // Amount: 0.001 BNB
    const amount = hre.ethers.parseEther("0.001");

    try {
        const tx = await sender.sendTransaction({
            to: TIMELOCK_ADDR,
            value: amount
        });
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("SUCCESS: Timelock accepted BNB.");
    } catch (e) {
        console.error("FAILURE: Timelock rejected BNB.");
        console.error(e.reason || e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
