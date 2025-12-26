// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ExecutionRegistry is Ownable {
    
    mapping(address => bool) public isVerified;
    mapping(address => uint256) public verifiedAt;

    event VerificationStatusChanged(address indexed account, bool status);

    constructor() Ownable() {} 

    function setVerified(address account, bool status) external onlyOwner {
        isVerified[account] = status;
        if(status) {
            verifiedAt[account] = block.timestamp;
        }
        emit VerificationStatusChanged(account, status);
    }
}
