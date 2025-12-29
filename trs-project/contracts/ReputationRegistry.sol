// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @notice Tracks the performance score of Execution Partners.
 * @dev Scores dictate access to "Fast Track" funding.
 */
contract ReputationRegistry is Ownable {

    mapping(address => int256) public scores;
    mapping(address => bool) public authorizedCallers;

    event ScoreUpdated(address indexed executor, int256 newScore, int256 delta);
    event CallerAuthorized(address indexed caller, bool status);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not Authorized");
        _;
    }

    constructor() Ownable() {
        authorizedCallers[msg.sender] = true;
    }

    function setAuthorizedCaller(address _caller, bool _status) external onlyOwner {
        authorizedCallers[_caller] = _status;
        emit CallerAuthorized(_caller, _status);
    }

    function updateScore(address _executor, int256 _delta) external onlyAuthorized {
        int256 current = scores[_executor];
        int256 next = current + _delta;
        
        // Clamp between 0 and 100
        if (next > 100) next = 100;
        if (next < 0) next = 0;

        scores[_executor] = next;
        emit ScoreUpdated(_executor, next, _delta);
    }

    function getScore(address _executor) external view returns (int256) {
        return scores[_executor];
    }
}
