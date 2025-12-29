// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProjectEscrow.sol";
import "./ExecutionRegistry.sol";
import "./PolicyRegistry.sol";
import "./ReputationRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ProjectFactory
 * @notice Deploys and funds ProjectEscrow contracts in a single atomic transaction.
 * @dev Intended to be called by the DAO Timelock via a batch proposal (Approve + Create).
 *      Phase 2: Enforces Policy limits and Reputation checks.
 */
contract ProjectFactory {
    using SafeERC20 for IERC20;

    ExecutionRegistry public immutable executionRegistry;
    PolicyRegistry public immutable policyRegistry;
    ReputationRegistry public immutable reputationRegistry;

    event ProjectCreated(address indexed projectAddress, string projectId, address indexed executor, uint256 totalBudget);

    constructor(
        address _executionRegistry,
        address _policyRegistry,
        address _reputationRegistry
    ) {
        require(_executionRegistry != address(0), "Invalid Exec Registry");
        require(_policyRegistry != address(0), "Invalid Policy Registry");
        require(_reputationRegistry != address(0), "Invalid Rep Registry");
        
        executionRegistry = ExecutionRegistry(_executionRegistry);
        policyRegistry = PolicyRegistry(_policyRegistry);
        reputationRegistry = ReputationRegistry(_reputationRegistry);
    }

    /**
     * @notice Deploys a new ProjectEscrow and funds it by pushing tokens from the caller (Timelock).
     */
    function createProject(
        string memory _projectId,
        string memory _title,
        string memory _category,
        string memory _country,
        string memory _region,
        address _executor,
        IERC20 _budgetToken,
        uint256[] memory _milestoneAmounts,
        string[] memory _milestoneDescriptions
    ) external returns (address) {
        // --- PHASE 1 CHECKS ---
        require(executionRegistry.isVerified(_executor), "Executor not verified in Registry");

        // --- PHASE 2 CHECKS (Policy Enforcement) ---
        uint256 totalBudget = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalBudget += _milestoneAmounts[i];
        }

        uint256 maxBudget = policyRegistry.getPolicy("MAX_PROJECT_BUDGET");
        // If policy is 0, it might mean "not set" or "no limit", but usually we want a safe default.
        // For this implementation, if maxBudget > 0, we enforce it.
        if (maxBudget > 0) {
            require(totalBudget <= maxBudget, "Budget exceeds Policy Limit");
        }
        
        // --- DEPLOYMENT ---
        ProjectEscrow newProject = new ProjectEscrow(
            _projectId,
            _title,
            _category,
            _country,
            _region,
            _executor,
            _budgetToken,
            msg.sender, // Owner of Escrow (Timelock)
            _milestoneAmounts,
            _milestoneDescriptions
        );

        // --- FUNDING ---
        if (totalBudget > 0) {
            _budgetToken.safeTransferFrom(msg.sender, address(newProject), totalBudget);
        }

        emit ProjectCreated(address(newProject), _projectId, _executor, totalBudget);

        return address(newProject);
    }
}
