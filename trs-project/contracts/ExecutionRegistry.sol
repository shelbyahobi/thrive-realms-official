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

    address[] public projectAddresses;
    mapping(address => ProjectInfo) public projects;

    event ProjectRegistered(address indexed project, string name);

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
