// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title RevenueRouter
 * @dev Splits incoming ETH/BNB revenue between Treasury, DividendVault, and other buckets.
 */
contract RevenueRouter is Ownable {
    using Address for address payable;

    // Buckets
    address payable public treasury;
    address payable public dividendVault;
    address payable public executionRewards; // NEW: Team/Pod Incentives
    address payable public riskReserve;      // NEW: Emergency/Insurance

    // Shares (Basis Points: 10000 = 100%)
    uint256 public treasuryShare = 4000;   // 40% Reinvestment
    uint256 public executionShare = 3000;  // 30% Incentives
    uint256 public dividendShare = 2000;   // 20% Holders
    uint256 public riskShare = 1000;       // 10% Reserve

    // Stats
    uint256 public totalProcessed;

    event RevenueProcessed(uint256 amount, uint256 tAmt, uint256 eAmt, uint256 dAmt, uint256 rAmt);
    event ConfigUpdated(uint256 tShare, uint256 eShare, uint256 dShare, uint256 rShare);

    constructor(
        address payable _treasury, 
        address payable _dividendVault,
        address payable _executionRewards,
        address payable _riskReserve
    ) Ownable() {
        treasury = _treasury;
        dividendVault = _dividendVault;
        executionRewards = _executionRewards;
        riskReserve = _riskReserve;
    }

    receive() external payable {
        processRevenue();
    }

    function processRevenue() public payable {
        uint256 amount = address(this).balance;
        if (amount == 0) return;

        uint256 tAmt = (amount * treasuryShare) / 10000;
        uint256 eAmt = (amount * executionShare) / 10000;
        uint256 dAmt = (amount * dividendShare) / 10000;
        uint256 rAmt = amount - tAmt - eAmt - dAmt; // Remainder to risk reserve

        if (tAmt > 0) treasury.sendValue(tAmt);
        if (eAmt > 0) executionRewards.sendValue(eAmt);
        if (dAmt > 0) dividendVault.sendValue(dAmt);
        if (rAmt > 0) riskReserve.sendValue(rAmt);

        totalProcessed += amount;
        emit RevenueProcessed(amount, tAmt, eAmt, dAmt, rAmt);
    }

    function setShares(uint256 _tShare, uint256 _eShare, uint256 _dShare, uint256 _rShare) external onlyOwner {
        require(_tShare + _eShare + _dShare + _rShare == 10000, "Must equal 100%");
        treasuryShare = _tShare;
        executionShare = _eShare;
        dividendShare = _dShare;
        riskShare = _rShare;
        emit ConfigUpdated(_tShare, _eShare, _dShare, _rShare);
    }
}
