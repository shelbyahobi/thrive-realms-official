const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

module.exports = buildModule("DAO", (m) => {
    const deployer = m.getAccount(0);

    // 1. Deploy KYC Registry (Needed for Governor)
    const kycRegistry = m.contract("KYCRegistry", [deployer]);

    // 2. Deploy Timelock (Treasury)
    const timelock = m.contract("TRSTimelock", [
        0,
        [],
        [],
        deployer
    ]);

    // 3. Deploy Token
    // MINT TO DEPLOYER (TESTNET ONLY): Allows easier liquidity setup
    const token = m.contract("TRSToken", [deployer, deployer]);

    // 4. Deploy Governor
    const governor = m.contract("TRSGovernor", [
        token,
        timelock,
        0, // delay
        150, // period (TEST: ~8 mins) | MAINNET: 50400 (~1 week)
        m.getParameter("proposalThreshold", 0n),
        1 // quorum numerator (TEST: 1%) | MAINNET: 4 (4%)
    ]);

    // 5. Deploy Sale
    // SALE SOURCE = DEPLOYER (TESTNET ONLY)
    const sale = m.contract("TRSSale", [token, deployer]);

    // 5.1 Approve Sale Contract to spend Deployer's tokens
    m.call(token, "approve", [sale, "115792089237316195423570985008687907853269984665640564039457584007913129639935"]);

    // 6. Deploy FounderSplitter
    const founderSplitter = m.contract("FounderSplitter", [[deployer], [100]]);

    // 7. Deploy DividendVault
    const dividendVault = m.contract("DividendVault", [token]);

    // 8. Deploy ProjectRegistry
    const projectRegistry = m.contract("ProjectRegistry", []);

    // 9. Deploy New Protocols (Company, Job, Execution)
    const companyRegistry = m.contract("CompanyRegistry", [token]);
    const executionRegistry = m.contract("ExecutionRegistry", []);
    const jobRegistry = m.contract("JobRegistry", [token, executionRegistry, companyRegistry]);

    // 9. Setup Roles
    const PROPOSER_ROLE = m.staticCall(timelock, "PROPOSER_ROLE");
    m.call(timelock, "grantRole", [PROPOSER_ROLE, governor], { id: "grant_proposer_role" });

    const EXECUTOR_ROLE = m.staticCall(timelock, "EXECUTOR_ROLE");
    m.call(timelock, "grantRole", [EXECUTOR_ROLE, "0x0000000000000000000000000000000000000000"], { id: "grant_executor_role" });

    return { token, timelock, governor, sale, kycRegistry, founderSplitter, dividendVault, projectRegistry, companyRegistry, executionRegistry, jobRegistry };
});
