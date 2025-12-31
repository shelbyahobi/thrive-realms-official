// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceSettings
 * @notice Stores global DAO configuration and state phases.
 * @dev Owned by the Timelock controller.
 */
contract GovernanceSettings is Ownable {
    
    enum DaoPhase { 
        GOVERNANCE_ONLY, 
        LEGAL_STRUCTURE_APPROVED, 
        LEGAL_SETUP_IN_PROGRESS, 
        LEGAL_READY, 
        FUNDING_ENABLED, 
        EXECUTION_LIVE 
    }

    enum EntityType { 
        DAO_LLC, 
        FOUNDATION_SUBSIDIARY, 
        HYBRID_WRAPPER, 
        EXPLORATORY 
    }

    enum ControlModel { 
        MULTISIG, 
        TIMELOCK, 
        HYBRID 
    }

    struct LegalStructure {
        EntityType structureType;
        string jurisdiction;
        string[] scope; // E.g., "Hold equity", "Sign contracts"
        ControlModel controlModel;
        uint256 setupBudget;
        address facilitator;
        uint256 approvedAt;
    }

    // State
    DaoPhase public currentPhase;
    LegalStructure public legalStructure;

    // Events
    event PhaseUpdated(DaoPhase oldPhase, DaoPhase newPhase);
    event LegalStructureApproved(
        EntityType structureType, 
        string jurisdiction, 
        uint256 budget,
        address facilitator
    );
    event LegalSetupAuthorized(address executor, uint256 amount);

    constructor() Ownable() {
        currentPhase = DaoPhase.GOVERNANCE_ONLY;
    }

    /**
     * @notice Locks in the Legal Structure choice and advances phase.
     * @dev Accessible only by Owner (Timelock).
     */
    function setLegalStructure(
        EntityType _structureType,
        string memory _jurisdiction,
        string[] memory _scope,
        ControlModel _controlModel,
        uint256 _setupBudget,
        address _facilitator
    ) external onlyOwner {
        require(currentPhase == DaoPhase.GOVERNANCE_ONLY, "Phase already advanced");

        legalStructure = LegalStructure({
            structureType: _structureType,
            jurisdiction: _jurisdiction,
            scope: _scope,
            controlModel: _controlModel,
            setupBudget: _setupBudget,
            facilitator: _facilitator,
            approvedAt: block.timestamp
        });

        _setPhase(DaoPhase.LEGAL_STRUCTURE_APPROVED);

        emit LegalStructureApproved(_structureType, _jurisdiction, _setupBudget, _facilitator);
    }

    /**
     * @notice Authorizes funding for legal setup and advances phase.
     * @dev Called by Timelock via Proposal execution.
     */
    function authorizeLegalSetupFunding(address _executor, uint256 _amount) external onlyOwner {
        require(currentPhase == DaoPhase.LEGAL_STRUCTURE_APPROVED, "Legal structure not approved");
        require(_amount <= legalStructure.setupBudget, "Exceeds authorized setup budget");

        emit LegalSetupAuthorized(_executor, _amount);
        _setPhase(DaoPhase.LEGAL_SETUP_IN_PROGRESS);
    }

    /**
     * @notice Manually update phase if needed (Emergency/Adjustment).
     */
    function setPhase(DaoPhase _newPhase) external onlyOwner {
        _setPhase(_newPhase);
    }

    function _setPhase(DaoPhase _newPhase) internal {
        DaoPhase oldPhase = currentPhase;
        currentPhase = _newPhase;
        emit PhaseUpdated(oldPhase, _newPhase);
    }

    function getLegalStructure() external view returns (LegalStructure memory) {
        return legalStructure;
    }
}
