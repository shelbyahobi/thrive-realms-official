// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ProjectEscrow.sol";

contract ProjectRegistry is Ownable {
    using SafeERC20 for IERC20;

    event ProjectCreated(address indexed escrow, string projectId, address executor);

    constructor() Ownable() {} // Deployer is owner initially, transfer to Timelock

    function createProject(
        string memory _projectId,
        string memory _title,
        string memory _category,
        string memory _country,
        string memory _region,
        address _executor,
        IERC20 _budgetToken,
        uint256 _totalBudget,
        uint256[] memory _milestoneAmounts,
        string[] memory _milestoneDescriptions
    ) external returns (address) {
        // 1. Deploy Escrow
        // Owner of Escrow will be the caller (DAO Timelock) or this Registry?
        // Better: Make the DAO Timelock the owner of the Escrow directly so it can call releaseMilestone.
        // Assuming msg.sender IS the Timelock (via Proposal execution).
        
        ProjectEscrow escrow = new ProjectEscrow(
            _projectId, _title, _category, _country, _region, _executor, _budgetToken, 
            msg.sender, // Owner of Escrow
            _milestoneAmounts, _milestoneDescriptions
        );

        // 2. Fund Escrow
        // Requires msg.sender (Timelock) to have approved this Registry to spend '_totalBudget'
        if (_totalBudget > 0) {
            _budgetToken.safeTransferFrom(msg.sender, address(escrow), _totalBudget);
        }

        emit ProjectCreated(address(escrow), _projectId, _executor);
        return address(escrow);
    }
}
