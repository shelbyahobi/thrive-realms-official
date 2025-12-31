// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ExecutionRegistry is Ownable {
    
    enum EntityType { UNKNOWN, STANDARD, FIAT_BRIDGE, EXECUTION_POD }

    struct EntityProfile {
        EntityType entityType;
        string name;
        string jurisdiction;
        string legalMetadata; // IPFS hash or link
        uint256 registeredAt;
        bool isVerified;
    }

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

    // Mappings
    mapping(address => EntityProfile) public profiles;
    mapping(address => ProjectInfo) public projects;
    mapping(address => AuditResult[]) public projectAudits;
    address[] public projectAddresses;

    // Legacy support (to avoid breaking changes if possible, though we are redeploying)
    function isVerified(address account) external view returns (bool) {
        return profiles[account].isVerified;
    }

    // Events
    event EntityRegistered(address indexed account, EntityType entityType, string name);
    event EntityVerified(address indexed account, bool status);
    event ProjectRegistered(address indexed project, string name);
    event ProjectAudited(address indexed project, address indexed auditor, uint8 score);

    constructor() Ownable() {} 

    // --- ENTITY MANAGEMENT (Phase 4 & Phase 3) ---
    function registerEntity(
        address _account,
        EntityType _type,
        string memory _name,
        string memory _jurisdiction,
        string memory _legalMetadata
    ) external onlyOwner {
        profiles[_account] = EntityProfile({
            entityType: _type,
            name: _name,
            jurisdiction: _jurisdiction,
            legalMetadata: _legalMetadata,
            registeredAt: block.timestamp,
            isVerified: true
        });
        emit EntityRegistered(_account, _type, _name);
        emit EntityVerified(_account, true);
    }

    // Phase 3: Fiat Bridge Authorization
    function authorizeFiatBridge(address _bridge, uint256 _cap) external onlyOwner {
        profiles[_bridge].entityType = EntityType.FIAT_BRIDGE;
        profiles[_bridge].isVerified = true;
        // logic for caps would go here if storing on-chain, for now strictly entity typing
        emit EntityVerified(_bridge, true);
    }

    // Phase 3: Execution Pod Creation
    function createPod(address _podTreasury, address _executor, uint256 _cap) external onlyOwner {
        profiles[_podTreasury].entityType = EntityType.EXECUTION_POD;
        profiles[_podTreasury].isVerified = true;
        
        // Register the executor wallet as well if needed, or link them
        // For MVP, we treat the podTreasury as the primary entity address
        emit EntityRegistered(_podTreasury, EntityType.EXECUTION_POD, "Execution Pod");
    }

    // Legacy Setter (mapped to STANDARD type)
    function setVerified(address account, bool status) external onlyOwner {
        profiles[account].isVerified = status;
        if (profiles[account].entityType == EntityType.UNKNOWN) {
            profiles[account].entityType = EntityType.STANDARD;
        }
        emit EntityVerified(account, status);
    }

    function getEntity(address account) external view returns (EntityProfile memory) {
        return profiles[account];
    }

    // --- PROJECT MANAGEMENT ---

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
    
    modifier onlyVerifiedExecutors() {
        require(profiles[msg.sender].isVerified || msg.sender == owner(), "Not verified");
        _;
    }
}
