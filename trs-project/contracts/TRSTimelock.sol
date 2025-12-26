// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TRSTimelock is TimelockController {
    // minDelay: How long a proposal must wait before execution
    // proposers: Who can schedule operations (The Governor)
    // executors: Who can execute operations (The Public/Anyone usually)
    // admin: Who can grant/revoke roles (Often the Timelock itself, so it's self-governed)
    
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}
