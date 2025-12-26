// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ProjectEscrow is Ownable {
    using SafeERC20 for IERC20;

    struct Milestone {
        uint256 amount;
        string description;
        bool approved;
        bool paid;
    }

    // Immutable Parameters
    string public projectId;
    string public title;
    string public category;
    string public country;
    string public region;
    address public executor;
    IERC20 public budgetToken;
    
    Milestone[] public milestones;
    
    event MilestoneReleased(uint256 indexed index, uint256 amount);

    constructor(
        string memory _projectId,
        string memory _title,
        string memory _category,
        string memory _country,
        string memory _region,
        address _executor,
        IERC20 _budgetToken,
        address _owner,
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
        
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                description: _milestoneDescriptions[i],
                approved: false,
                paid: false
            }));
        }
        
        transferOwnership(_owner);
    }

    function releaseMilestone(uint256 index) external onlyOwner {
        require(index < milestones.length, "Invalid index");
        Milestone storage m = milestones[index];
        require(!m.paid, "Already paid");
        
        m.approved = true;
        m.paid = true;
        
        budgetToken.safeTransfer(executor, m.amount);
        emit MilestoneReleased(index, m.amount);
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
