const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";
    const TIMELOCK_ADDRESS = "0xEE72dD156B33806169C5c23bF9588A7773c195F1";

    // Config
    const VOTING_DELAY = 1; // 1 block
    const VOTING_PERIOD = 200; // 200 blocks (~10 mins)
    const PROPOSAL_THRESHOLD = 0; // Handled by function override (24k)
    const QUORUM_NUMERATOR = 0; // 0% Quorum (Testing)

    const [deployer] = await hre.ethers.getSigners();
    console.log("Redeploying TRSGovernor (No-KYC) with account:", deployer.address);

    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    const governor = await Governor.deploy(
        TOKEN_ADDRESS,
        TIMELOCK_ADDRESS,
        VOTING_DELAY,
        VOTING_PERIOD,
        PROPOSAL_THRESHOLD,
        QUORUM_NUMERATOR
    );

    await governor.waitForDeployment();
    console.log("New TRSGovernor deployed to:", governor.target);

    // GRANT ROLES TO NEW GOVERNOR
    const Timelock = await hre.ethers.getContractFactory("TRSTimelock");
    const timelock = Timelock.attach(TIMELOCK_ADDRESS);

    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();

    console.log("Granting Timelock Roles to New Governor...");
    await (await timelock.grantRole(PROPOSER_ROLE, governor.target)).wait();
    await (await timelock.grantRole(EXECUTOR_ROLE, governor.target)).wait();
    await (await timelock.grantRole(CANCELLER_ROLE, governor.target)).wait();

    console.log("Roles Granted.");
    console.log("\nUpdate lib/contracts.ts with the new GOVERNOR address.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
