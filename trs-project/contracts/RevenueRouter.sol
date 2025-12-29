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

    // Shares (Basis Points: 10000 = 100%)
    uint256 public treasuryShare = 1000; // 10%
    uint256 public dividendShare = 9000; // 90%

    // Stats
    uint256 public totalProcessed;

    event RevenueProcessed(uint256 amount, uint256 treasuryAmt, uint256 dividendAmt);
    event ConfigUpdated(uint256 treasuryShare, uint256 dividendShare);

    constructor(address payable _treasury, address payable _dividendVault) Ownable() {
        treasury = _treasury;
        dividendVault = _dividendVault;
    }

    receive() external payable {
        processRevenue();
    }

    function processRevenue() public payable {
        uint256 amount = address(this).balance;
        if (amount == 0) return;

        uint256 tAmt = (amount * treasuryShare) / 10000;
        uint256 dAmt = amount - tAmt; // Remainder goes to dividends to avoid dust

        if (tAmt > 0) {
            treasury.sendValue(tAmt);
        }
        if (dAmt > 0) {
            dividendVault.sendValue(dAmt);
        }

        totalProcessed += amount;
        emit RevenueProcessed(amount, tAmt, dAmt);
    }

    function setShares(uint256 _treasuryShare, uint256 _dividendShare) external onlyOwner {
        require(_treasuryShare + _dividendShare == 10000, "Must equal 100%");
        treasuryShare = _treasuryShare;
        dividendShare = _dividendShare;
        emit ConfigUpdated(_treasuryShare, _dividendShare);
    }
}
