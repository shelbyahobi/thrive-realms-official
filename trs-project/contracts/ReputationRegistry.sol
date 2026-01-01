// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationRegistry
 * @notice Tracks the multi-dimensional reputation of Execution Partners.
 * @dev Phase 4 Upgrade: Supports Execution, Reporting, Governance, and Dispute scores.
 */
contract ReputationRegistry is Ownable {

    struct Reputation {
        uint32 executionScore;  // 0-100: Reliability in delivering milestones
        uint32 reportingScore;  // 0-100: Timeliness and quality of reports
        uint32 governanceScore; // 0-100: Participation in DAO votes
        uint32 disputeScore;    // 0-100: inverse risk (100 = no disputes, 0 = many disputes)
        bool isFlagged;         // If true, blocked from Fast Track regardless of scores
    }

    struct Thresholds {
        uint32 minExecution;
        uint32 minReporting;
        uint32 minDispute;
        bool exists;
    }

    // Mapping of Executor Address -> Reputation
    mapping(address => Reputation) public reputation;
    
    // Mapping of Authorized Updaters (e.g. ProjectFactory, DisputeResolver, Admin)
    mapping(address => bool) public authorizedCallers;

    // Mapping of Proposal Type ID -> Thresholds
    mapping(uint256 => Thresholds) public typeThresholds;

    event ScoreUpdated(address indexed executor, string component, uint32 newScore);
    event FlagUpdated(address indexed executor, bool isFlagged);
    event ThresholdSet(uint256 indexed typeId, uint32 minExec, uint32 minReport, uint32 minDispute);
    event PolicyUpdated(string newHash);

    // IPFS Hash of the Reputation Constitution
    string public policyHash;


    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not Authorized");
        _;
    }

    constructor() Ownable() {
        authorizedCallers[msg.sender] = true;
        
        // Initialize Default Reputation for new entities? 
        // No, strict 0 start ensures "Earned Trust".
    }

    function setAuthorizedCaller(address _caller, bool _status) external onlyOwner {
        authorizedCallers[_caller] = _status;
    }

    function setPolicyHash(string memory _hash) external onlyOwner {
        policyHash = _hash;
        emit PolicyUpdated(_hash);
    }

    /**
     * @notice Allow Factory to register new Projects as authorized scorers.
     */
    function grantAutomationRole(address _automationContract) external onlyAuthorized {
        authorizedCallers[_automationContract] = true;
    }

    /**
     * @notice Admin function to configure Fast Track thresholds for a specific proposal/project type.
     * @param _typeId The ID representing the proposal category (0=SME, 1=Infra, etc.)
     */
    function setTypeThresholds(
        uint256 _typeId, 
        uint32 _minExec, 
        uint32 _minReport, 
        uint32 _minDispute
    ) external onlyOwner {
        typeThresholds[_typeId] = Thresholds({
            minExecution: _minExec,
            minReporting: _minReport,
            minDispute: _minDispute,
            exists: true
        });
        emit ThresholdSet(_typeId, _minExec, _minReport, _minDispute);
    }

    /**
     * @notice Updates a specific component of an executor's reputation.
     * @dev Use int32 for delta to allow negative adjustments.
     */
    function updateScore(address _executor, uint8 _componentId, int32 _delta) external onlyAuthorized {
        Reputation storage rep = reputation[_executor];
        
        // Default dispute score to 100 (Perfect) if untouched and delta is negative?
        // Better strategy: Initialize scores on first interaction if needed. 
        // For now, simple clamping.

        uint32 currentVal;
        if (_componentId == 0) currentVal = rep.executionScore;
        else if (_componentId == 1) currentVal = rep.reportingScore;
        else if (_componentId == 2) currentVal = rep.governanceScore;
        else if (_componentId == 3) currentVal = rep.disputeScore;
        else revert("Invalid Component ID");

        int256 next = int256(uint256(currentVal)) + _delta;
        
        if (next > 100) next = 100;
        if (next < 0) next = 0;

        uint32 finalVal = uint32(uint256(next));

        if (_componentId == 0) rep.executionScore = finalVal;
        else if (_componentId == 1) rep.reportingScore = finalVal;
        else if (_componentId == 2) rep.governanceScore = finalVal;
        else if (_componentId == 3) rep.disputeScore = finalVal;

        string[4] memory labels = ["Execution", "Reporting", "Governance", "Dispute"];
        emit ScoreUpdated(_executor, labels[_componentId], finalVal);
    }

    function setFlag(address _executor, bool _flag) external onlyAuthorized {
        reputation[_executor].isFlagged = _flag;
        emit FlagUpdated(_executor, _flag);
    }

    /**
     * @notice Checks if an executor is eligible for Fast Track for a specific proposal type.
     * @return bool True if eligible
     */
    function isFastTrackEligible(address _executor, uint256 _typeId) external view returns (bool) {
        Reputation memory rep = reputation[_executor];
        Thresholds memory thresh = typeThresholds[_typeId];

        // If no thresholds define, Fast Track is CLOSED by default
        if (!thresh.exists) return false;

        // Must not be flagged
        if (rep.isFlagged) return false;

        // Must meet all criteria
        if (rep.executionScore < thresh.minExecution) return false;
        if (rep.reportingScore < thresh.minReporting) return false;
        
        // Dispute Score: 100 is good, 0 is bad. So rep.dispute must be >= thresh.minDispute
        // Note: Logic assumes we start dispute score at 100 or grant it? 
        // Implementation Detail: Let's assume initialized or manual set. 
        // If 0 (default), it will fail checks requiring high dispute score. New entrants must prove safety?
        // Or maybe default is 100?
        // For conservative "Earned Trust", starting at 0 is safe.
        if (rep.disputeScore < thresh.minDispute) return false;

        return true;
    }
    
    function getReputation(address _executor) external view returns (Reputation memory) {
        return reputation[_executor];
    }
}
