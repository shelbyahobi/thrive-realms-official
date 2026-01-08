// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReputationRegistry.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ProjectEscrow is Ownable, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Milestone {
        uint256 amount;
        string description;
        bool approved;
        bool paid;
        string reportURI; // IPFS Hash of the proof-of-work
    }

    // Immutable Parameters
    string public projectId;
    string public title;
    string public category;
    string public country;
    string public region;
    address public executor;
    IERC20 public budgetToken;
    ReputationRegistry public reputationRegistry;
    
    Milestone[] public milestones;
    
    event MilestoneReleased(uint256 indexed index, uint256 amount);
    event ReportSubmitted(uint256 indexed index, string reportURI);
    event ExecutorChanged(address indexed oldExecutor, address indexed newExecutor);
    event FundsReturned(address indexed token, uint256 amount);

    modifier onlyExecutor() {
        require(msg.sender == executor, "Not Executor");
        _;
    }

    constructor(
        string memory _projectId,
        string memory _title,
        string memory _category,
        string memory _country,
        string memory _region,
        address _executor,
        IERC20 _budgetToken,
        address _owner,
        address _reputationRegistry,
        uint256[] memory _milestoneAmounts,
        string[] memory _milestoneDescriptions
    ) Ownable() {
        require(_milestoneAmounts.length == _milestoneDescriptions.length, "Array mismatch");
        
        projectId = _projectId;
        title = _title;
        category = _category;
        country = _country;
        region = _region;
        executor = _executor;
        budgetToken = _budgetToken;
        reputationRegistry = ReputationRegistry(_reputationRegistry);
        
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                description: _milestoneDescriptions[i],
                approved: false,
                paid: false,
                reportURI: ""
            }));
        }
        
        transferOwnership(_owner);
    }

    function submitReport(uint256 index, string memory _reportURI) external onlyExecutor whenNotPaused nonReentrant {
        require(index < milestones.length, "Invalid index");
        Milestone storage m = milestones[index];
        require(!m.paid, "Already paid");
        require(bytes(m.reportURI).length == 0, "Report already submitted");

        m.reportURI = _reportURI;
        
        // AUTOMATION: +2 Reporting Score
        try reputationRegistry.updateScore(executor, 1, 2) {} catch {}

        emit ReportSubmitted(index, _reportURI);
    }

    function releaseMilestone(uint256 index) external onlyOwner whenNotPaused nonReentrant {
        require(index < milestones.length, "Invalid index");
        Milestone storage m = milestones[index];
        require(!m.paid, "Already paid");
        require(bytes(m.reportURI).length > 0, "Rule: No Report = No Money");
        
        m.approved = true;
        m.paid = true;
        
        budgetToken.safeTransfer(executor, m.amount);

        // AUTOMATION: +5 Execution Score
        try reputationRegistry.updateScore(executor, 0, 5) {} catch {}

        emit MilestoneReleased(index, m.amount);
    }

    // --- Emergency / Governance Override Functions (Phase 1 Compliance) ---

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setExecutor(address _newExecutor) external onlyOwner {
        require(_newExecutor != address(0), "Invalid address");
        emit ExecutorChanged(executor, _newExecutor);
        executor = _newExecutor;
    }

    function returnFunds(IERC20 _token, uint256 _amount) external onlyOwner {
        _token.safeTransfer(owner(), _amount);
        emit FundsReturned(address(_token), _amount);
    }
    
    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }
    
    function getMilestone(uint256 index) external view returns (
        uint256 amount,
        string memory description,
        bool approved,
        bool paid
    ) {
        Milestone storage m = milestones[index];
        return (m.amount, m.description, m.approved, m.paid);
    }
}
