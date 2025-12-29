// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PolicyRegistry
 * @notice Stores governance-approved strictures (caps, limits, thresholds).
 * @dev Used by other contracts (ProjectFactory) to enforce rules without manual voting.
 */
contract PolicyRegistry is Ownable {
    
    // Configurable Policies
    mapping(bytes32 => uint256) public policies;

    event PolicyUpdated(string key, uint256 value);

    constructor() Ownable() {
        // Default Policies
        _setPolicy("MAX_PROJECT_BUDGET", 50000 ether); // 50k TRS Limit
        _setPolicy("MIN_REPUTATION_FAST_TRACK", 80);   // Score of 80/100
        _setPolicy("GLOBAL_EPOCH_CAP", 1000000 ether); // 1M TRS per epoch
    }

    function setPolicy(string memory _key, uint256 _value) external onlyOwner {
        _setPolicy(_key, _value);
    }

    function _setPolicy(string memory _key, uint256 _value) internal {
        bytes32 keyHash = keccak256(abi.encodePacked(_key));
        policies[keyHash] = _value;
        emit PolicyUpdated(_key, _value);
    }

    function getPolicy(string memory _key) external view returns (uint256) {
        return policies[keccak256(abi.encodePacked(_key))];
    }
}
