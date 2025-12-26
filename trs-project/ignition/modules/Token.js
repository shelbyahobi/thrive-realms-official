const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TokenModule", (m) => {
    // Deploy Mock Logic if we are on a local chain (we can't easily detect network here in Ignition purely, 
    // but we can default to deploying a mock for now or accept an address)

    // For simplicity in this dev phase, we will deploy a MockOracle first
    const mockOracle = m.contract("MockV3Aggregator", [8, 30000000000]); // 8 decimals, $300 price

    // Deploy TRSToken with the MockOracle address
    const initialSupply = 1000000; // 1 million tokens
    const owner = m.getAccount(0); // Use the first account as owner

    const token = m.contract("TRSToken", [owner, initialSupply, mockOracle]);

    return { token, mockOracle };
});
