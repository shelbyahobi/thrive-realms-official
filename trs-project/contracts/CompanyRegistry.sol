// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CompanyRegistry
 * @dev Manages verification of execution entities (Companies).
 * Flow: 
 * 1. Company calls register()
 * 2. Governance (Timelock) calls approveCompany()
 * 3. Only verified companies can be selected as Executors in Proposals.
 */
contract CompanyRegistry is Ownable {
    
    struct Company {
        string name;
        string metadataURI; // IPFS hash for profile, logo, legal info
        uint256 registeredAt;
        bool isVerified;
        bool isPending;
    }

    IERC20 public token;
    uint256 public minStakeRequirement; // Minimum TRS to hold to be a company

    mapping(address => Company) public companies;
    address[] public companyList;

    event CompanyRequested(address indexed wallet, string name);
    event CompanyApproved(address indexed wallet);
    event CompanyRevoked(address indexed wallet);
    event StakeRequirementUpdated(uint256 newAmount);

    constructor(address _token) Ownable() {
        token = IERC20(_token);
        minStakeRequirement = 1200 * 10**18; // Default: Member Tier equivalent
    }

    // 1. Company requests access
    function requestRegistration(string memory _name, string memory _metadataURI) external {
        require(token.balanceOf(msg.sender) >= minStakeRequirement, "Insufficient TRS Stake");
        require(!companies[msg.sender].isVerified, "Already verified");

        if (!companies[msg.sender].isPending) {
             companyList.push(msg.sender);
        }

        companies[msg.sender] = Company({
            name: _name,
            metadataURI: _metadataURI,
            registeredAt: block.timestamp,
            isVerified: false,
            isPending: true
        });

        emit CompanyRequested(msg.sender, _name);
    }

    // 2. DAO (Owner) approves access
    function approveCompany(address _company) external onlyOwner {
        require(companies[_company].isPending, "Company request not found");
        companies[_company].isVerified = true;
        companies[_company].isPending = false;
        emit CompanyApproved(_company);
    }

    // 3. DAO (Owner) revokes access
    function revokeCompany(address _company) external onlyOwner {
        companies[_company].isVerified = false;
        emit CompanyRevoked(_company);
    }

    function setStakeRequirement(uint256 _amount) external onlyOwner {
        minStakeRequirement = _amount;
        emit StakeRequirementUpdated(_amount);
    }

    // READING
    function isVerified(address _company) external view returns (bool) {
        return companies[_company].isVerified;
    }

    function getCompany(address _company) external view returns (Company memory) {
        return companies[_company];
    }

    function getAllCompanies() external view returns (address[] memory) {
        return companyList;
    }

    function getVerifiedCompanies() external view returns (address[] memory) {
        // This is gas heavy if list is huge, but fine for prototype/DAO scale (<1000)
        uint256 count = 0;
        for (uint i = 0; i < companyList.length; i++) {
            if (companies[companyList[i]].isVerified) count++;
        }

        address[] memory verified = new address[](count);
        uint256 index = 0;
        for (uint i = 0; i < companyList.length; i++) {
            if (companies[companyList[i]].isVerified) {
                verified[index] = companyList[i];
                index++;
            }
        }
        return verified;
    }
}
