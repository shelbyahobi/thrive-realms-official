require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
// console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY); // REMOVED FOR SECURITY

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // often helps with stack too deep
    },
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
