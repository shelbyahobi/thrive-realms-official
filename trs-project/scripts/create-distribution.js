const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const VAULT_ADDRESS = "0x98C16ff04C9Ef26Ce6F2995Eb446c409AedA29Bc";
    const TIMELOCK_ADDRESS = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";

    const token = await hre.ethers.getContractAt("TRSToken", TOKEN_ADDRESS);
    const vault = await hre.ethers.getContractAt("DividendVault", VAULT_ADDRESS);
    const timelock = await hre.ethers.getContractAt("TRSTimelock", TIMELOCK_ADDRESS);

    console.log("Creating Distribution...");

    // 1. Trigger Snapshot via Timelock
    const snapshotData = token.interface.encodeFunctionData("snapshot");
    const salt = hre.ethers.hexlify(hre.ethers.randomBytes(32));

    console.log("Scheduling Snapshot...");
    // Timelock schedule might fail if delay > 0, but we set minDelay=0
    try {
        await (await timelock.schedule(TOKEN_ADDRESS, 0, snapshotData, hre.ethers.ZeroHash, salt, 0)).wait();
    } catch (e) {
        console.log("Schedule Error (ignoring if dup):", e.shortMessage || e.message);
    }

    console.log("Executing Snapshot...");
    try {
        await (await timelock.execute(TOKEN_ADDRESS, 0, snapshotData, hre.ethers.ZeroHash, salt)).wait();
        console.log("Snapshot Created via Timelock.");
    } catch (e) {
        console.log("Execute Error:", e.shortMessage || e.message);
    }

    // 2. Deposit Funds into Vault
    const snapshotId = 1; // Assuming 1 for first run
    const amount = hre.ethers.parseEther("0.1");
    console.log(`Depositing ${hre.ethers.formatEther(amount)} BNB for Distribution...`);

    try {
        await (await vault.deposit(snapshotId, { value: amount })).wait();
        console.log("✅ Distribution Created!");
    } catch (e) {
        console.error("Deposit Failed. Maybe snapshot ID is wrong or not owner?", e.shortMessage || e.message);
        // Try snapshot ID 2 just in case
        try {
            await (await vault.deposit(2, { value: amount })).wait();
            console.log("✅ Distribution Created (Snapshot #2)!");
        } catch (e2) { }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
