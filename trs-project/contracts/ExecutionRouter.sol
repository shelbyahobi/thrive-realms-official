// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ProjectEscrow.sol";
import "./ExecutionRegistry.sol";

contract ExecutionRouter is Ownable {
    using SafeERC20 for IERC20;

    address public treasurySafe;
    address public operationsSafe;
    ExecutionRegistry public registry;

    event ProjectCreated(address indexed escrow, string projectId, address executor);

    constructor(address _treasurySafe, address _operationsSafe, address _registry) Ownable() {
        treasurySafe = _treasurySafe;
        operationsSafe = _operationsSafe;
        registry = ExecutionRegistry(_registry);
    }

    function updateSafes(address _treasurySafe, address _operationsSafe) external onlyOwner {
        treasurySafe = _treasurySafe;
        operationsSafe = _operationsSafe;
    }

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
        string[] memory _milestoneDescriptions,
        bool _useOperationsSafe // false = Treasury, true = Operations
    ) external onlyOwner returns (address) {
        require(registry.isVerified(_executor), "Executor not verified");

        // Deploy Escrow
        // Owner of Escrow -> msg.sender (The Timelock calling this function)
        ProjectEscrow escrow = new ProjectEscrow(
            _projectId, _title, _category, _country, _region, _executor, _budgetToken,
            msg.sender, // The Timelock becomes the owner to control releases
            _milestoneAmounts, _milestoneDescriptions
        );

        // Fund Escrow
        if (_totalBudget > 0) {
            address source = _useOperationsSafe ? operationsSafe : treasurySafe;
            require(source != address(0), "Safe not set");
            
            // Requires source to have approved this Router
            // Transfer From Safe -> Escrow
            _budgetToken.safeTransferFrom(source, address(escrow), _totalBudget);
        }

        emit ProjectCreated(address(escrow), _projectId, _executor);
        return address(escrow);
    }
}
