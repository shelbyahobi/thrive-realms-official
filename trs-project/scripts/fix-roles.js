const hre = require("hardhat");

async function main() {
    const TIMELOCK_ADDR = "0xC841B3A82F9258e7873ab09a77d8aD737D6bE1F2";
    const GOVERNOR_ADDR = "0x2A5d04d73f2313cf3f96c4a3FF7F37a51B845E27";

    const [deployer] = await hre.ethers.getSigners();
    console.log("Fixing Roles with Deployer:", deployer.address);

    const timelock = await hre.ethers.getContractAt("TRSTimelock", TIMELOCK_ADDR);

    // Role Hashes
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

    console.log("Granting EXECUTOR_ROLE to Governor...");
    await (await timelock.grantRole(EXECUTOR_ROLE, GOVERNOR_ADDR)).wait();
    console.log("✅ Governor now has EXECUTOR_ROLE");

    // Also grant to Zero Address for Open Execution (Standard Practice)
    // allowing anyone to pay the gas to execute a ready operation
    console.log("Granting EXECUTOR_ROLE to Zero Address (Open Execution)...");
    await (await timelock.grantRole(EXECUTOR_ROLE, hre.ethers.ZeroAddress)).wait();
    console.log("✅ Zero Address now has EXECUTOR_ROLE");

    // Check Proposer Role just in case
    const hasProposer = await timelock.hasRole(PROPOSER_ROLE, GOVERNOR_ADDR);
    console.log(`Governor has PROPOSER_ROLE: ${hasProposer}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
