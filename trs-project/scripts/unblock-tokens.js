const hre = require("hardhat");

const TIMELOCK_ADDR = "0xb244E79B90dB5B82C24268D2291c9c4C051371EF";
const TOKEN_ADDR = "0x9D4C2d67C049595da7Fd09aF94218A843cfA6d01";
const AMOUNT = "10000000"; // 10 Million

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Acting as Admin:", signer.address);

    const timelock = await hre.ethers.getContractAt("TRSTimelock", TIMELOCK_ADDR);
    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDR);

    // 1. Grant PROPOSER_ROLE to self (if not already)
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const hasRole = await timelock.hasRole(PROPOSER_ROLE, signer.address);
    if (!hasRole) {
        console.log("Granting PROPOSER_ROLE to self...");
        const tx = await timelock.grantRole(PROPOSER_ROLE, signer.address);
        await tx.wait();
        console.log("Granted.");
    } else {
        console.log("Already has PROPOSER_ROLE.");
    }

    // 2. Schedule Transfer
    // Target: Token, Value: 0, Data: transfer(signer, amount), Predecessor: 0, Salt: random
    const amountWei = hre.ethers.parseEther(AMOUNT);
    const transferData = token.interface.encodeFunctionData("transfer", [signer.address, amountWei]);
    const predecessor = hre.ethers.ZeroHash;
    const salt = hre.ethers.hexlify(hre.ethers.randomBytes(32));
    const delay = 0; // minDelay is 0

    console.log("Scheduling transfer of", AMOUNT, "TRS...");
    const txSchedule = await timelock.schedule(TOKEN_ADDR, 0, transferData, predecessor, salt, delay);
    await txSchedule.wait();
    console.log("Scheduled.");

    // 3. Execute Transfer
    console.log("Executing transfer...");
    const txExecute = await timelock.execute(TOKEN_ADDR, 0, transferData, predecessor, salt);
    await txExecute.wait();
    console.log("Executed! Tokens Transferred.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
