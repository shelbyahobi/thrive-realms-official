// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./TRSToken.sol";

contract DividendVault is Ownable, ReentrancyGuard {
    using Address for address payable;

    TRSToken public token;

    struct Distribution {
        uint256 snapshotId;
        uint256 totalAmount;
        uint256 totalSupplyAtSnapshot;
    }

    Distribution[] public distributions;
    mapping(uint256 => mapping(address => bool)) public hasClaimed; // distributionIndex => user => claimed

    // Accounting
    uint256 public totalDividendsDistributed; // Total amount assigned to distributions
    uint256 public totalDividendsClaimed;     // Total amount withdrawn by users

    event Deposited(address indexed sender, uint256 amount);
    event Distributed(uint256 indexed distributionId, uint256 snapshotId, uint256 amount);
    event Claimed(address indexed user, uint256 indexed distributionId, uint256 amount);

    constructor(address _token) Ownable() {
        token = TRSToken(_token);
    }

    // 1. Receive Funds (BNB)
    // Anyone can send BNB here (Revenue). It is held until 'distribute' is called.
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    // 2. Distribute Available Funds
    // Moves "Excess Balance" into a structured Distribution linked to a Snapshot.
    // The Owner (DAO) must first create a Snapshot on the Token contract.
    function distribute(uint256 snapshotId) external onlyOwner {
        uint256 currentBalance = address(this).balance;
        uint256 uncleanFunds = totalDividendsDistributed - totalDividendsClaimed; // Funds belonging to past distributions
        uint256 availableToDistribute = currentBalance - uncleanFunds;

        require(availableToDistribute > 0, "No new funds to distribute");
        
        // standard ERC20Snapshot logic: snapshotId must exist.
        // If we pass a future ID or invalid one, totalSupplyAt might be 0 or revert.
        uint256 supply = token.totalSupplyAt(snapshotId);
        require(supply > 0, "Invalid Snapshot: Supply is 0");

        distributions.push(Distribution({
            snapshotId: snapshotId,
            totalAmount: availableToDistribute,
            totalSupplyAtSnapshot: supply
        }));

        totalDividendsDistributed += availableToDistribute;
        emit Distributed(distributions.length - 1, snapshotId, availableToDistribute);
    }

    // 3. User Claims
    function claim(uint256 distributionId) external nonReentrant {
        require(distributionId < distributions.length, "Invalid ID");
        require(!hasClaimed[distributionId][msg.sender], "Already claimed");

        Distribution memory dist = distributions[distributionId];
        
        // Get user balance at that snapshot
        uint256 balanceAtSnapshot = token.balanceOfAt(msg.sender, dist.snapshotId);
        require(balanceAtSnapshot > 0, "No tokens held at snapshot");

        // Calculate Share: (UserBalance * TotalAmount) / TotalSupply
        uint256 share = (balanceAtSnapshot * dist.totalAmount) / dist.totalSupplyAtSnapshot;
        
        require(share > 0, "Share is zero");
        require(address(this).balance >= share, "Contract underfunded (Critical Error)");

        hasClaimed[distributionId][msg.sender] = true;
        totalDividendsClaimed += share;
        
        payable(msg.sender).sendValue(share);

        emit Claimed(msg.sender, distributionId, share);
    }
    
    function getDistributionCount() external view returns (uint256) {
        return distributions.length;
    }
}
