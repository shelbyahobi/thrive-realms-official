// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KYCRegistry is Ownable {
    mapping(address => bool) public isKyced;

    event KYCStatusChanged(address indexed user, bool status);

    constructor(address initialOwner) Ownable() {
        transferOwnership(initialOwner);
    }

    function setKYCStatus(address user, bool status) external onlyOwner {
        isKyced[user] = status;
        emit KYCStatusChanged(user, status);
    }

    function setKYCStatusBatch(address[] calldata users, bool status) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            isKyced[users[i]] = status;
            emit KYCStatusChanged(users[i], status);
        }
    }
}
