// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ExecutionRegistry is Ownable {
    
    mapping(address => bool) public isVerified;
    mapping(address => uint256) public verifiedAt;

    event VerificationStatusChanged(address indexed account, bool status);

    struct ProjectInfo {
        address escrowAddress;
        string name;
        uint256 registeredAt;
        bool active;
    }

    struct AuditResult {
        address auditor;
        uint8 score;
        string comment;
        uint256 timestamp;
    }

    address[] public projectAddresses;
    mapping(address => ProjectInfo) public projects;
    mapping(address => AuditResult[]) public projectAudits;

    event ProjectRegistered(address indexed project, string name);
    event ProjectAudited(address indexed project, address indexed auditor, uint8 score);

    constructor() Ownable() {} 

    function registerProject(address _escrow, string memory _name) external onlyVerifiedExecutors {
        require(_escrow != address(0), "Invalid address");
        
        projectAddresses.push(_escrow);
        projects[_escrow] = ProjectInfo({
            escrowAddress: _escrow,
            name: _name,
            registeredAt: block.timestamp,
            active: true
        });
        
        emit ProjectRegistered(_escrow, _name);
    }

    function auditProject(address _project, uint8 _score, string memory _comment) external {
        require(projects[_project].escrowAddress != address(0), "Project not found");
        require(_score <= 100, "Score must be 0-100");
        
        projectAudits[_project].push(AuditResult({
            auditor: msg.sender,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        }));
        
        emit ProjectAudited(_project, msg.sender, _score);
    }

    function getAudits(address _project) external view returns (AuditResult[] memory) {
        return projectAudits[_project];
    }

    function getAllProjects() external view returns (address[] memory) {
        return projectAddresses;
    }

    function setVerified(address account, bool status) external onlyOwner {
        isVerified[account] = status;
        if(status) {
            verifiedAt[account] = block.timestamp;
        }
        emit VerificationStatusChanged(account, status);
    }
    
    modifier onlyVerifiedExecutors() {
        require(isVerified[msg.sender] || msg.sender == owner(), "Not verified");
        _;
    }
}
