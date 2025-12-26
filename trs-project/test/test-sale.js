const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TRSToken Sale Test", function () {
  let TRSToken, signer;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();

    // Deploy Mock Oracle (BNB/USD, 8 decimals, $300 initial price)
    const MockV3AggregatorFactory = await ethers.getContractFactory("MockV3Aggregator");
    // 300 * 10^8 = 30000000000
    const mockOracle = await MockV3AggregatorFactory.deploy(8, 30000000000);
    await mockOracle.waitForDeployment();

    const TRSTokenFactory = await ethers.getContractFactory("TRSToken");
    // Deploy with signer as owner, 1 million initial supply, and mock oracle address
    TRSToken = await TRSTokenFactory.deploy(signer.address, 1000000, await mockOracle.getAddress());
    await TRSToken.waitForDeployment();
  });

  it("Should start the sale", async function () {
    await TRSToken.connect(signer).startSale();
    const saleActive = await TRSToken.saleActive();
    expect(saleActive).to.be.true;
  });

  it("Should allow buying tokens", async function () {
    await TRSToken.connect(signer).startSale();
    await TRSToken.connect(signer).buyTokens({
      value: ethers.parseEther("0.01"), // Send 0.01 BNB
    });
    const balance = await TRSToken.balanceOf(signer.address);
    expect(balance).to.be.gt(0);
  });
});
