// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OpportunityRegistry is Ownable {
    
    struct Opportunity {
        uint256 id;
        address submitter;
        string name;
        string country;
        string fundingAsk;
        string contactInfo;
        string ipfsHash; // Impact Summary / Video Link
        uint256 createdAt;
        uint256 totalScore;
        uint256 reviewCount;
        bool isOpenForVoting;
    }

    struct Review {
        address reviewer;
        uint8 score; // 0-100
        string comment;
        uint256 timestamp;
    }

    uint256 public nextId;
    mapping(uint256 => Opportunity) public opportunities;
    mapping(uint256 => Review[]) public reviews;
    mapping(uint256 => mapping(address => bool)) public hasReviewed;

    event OpportunitySubmitted(uint256 indexed id, address indexed submitter, string name);
    event OpportunityReviewed(uint256 indexed id, address indexed reviewer, uint8 score);

    constructor() Ownable() {}

    function submitOpportunity(
        string memory _name,
        string memory _country,
        string memory _fundingAsk,
        string memory _contactInfo,
        string memory _ipfsHash
    ) external {
        opportunities[nextId] = Opportunity({
            id: nextId,
            submitter: msg.sender,
            name: _name,
            country: _country,
            fundingAsk: _fundingAsk,
            contactInfo: _contactInfo,
            ipfsHash: _ipfsHash,
            createdAt: block.timestamp,
            totalScore: 0,
            reviewCount: 0,
            isOpenForVoting: false
        });

        emit OpportunitySubmitted(nextId, msg.sender, _name);
        nextId++;
    }

    function reviewOpportunity(uint256 _id, uint8 _score, string memory _comment) external {
        require(_id < nextId, "Opportunity does not exist");
        require(_score <= 100, "Score must be 0-100");
        // require(!hasReviewed[_id][msg.sender], "Already reviewed"); // Allow re-review? No, stick to one per address for now.

        reviews[_id].push(Review({
            reviewer: msg.sender,
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        }));

        Opportunity storage op = opportunities[_id];
        op.totalScore += _score;
        op.reviewCount += 1;
        // hasReviewed[_id][msg.sender] = true; // Uncomment to strict 1 vote

        emit OpportunityReviewed(_id, msg.sender, _score);
    }

    function getReviews(uint256 _id) external view returns (Review[] memory) {
        return reviews[_id];
    }
    
    function getOpportunity(uint256 _id) external view returns (Opportunity memory) {
        return opportunities[_id];
    }

    function getAllOpportunities() external view returns (Opportunity[] memory) {
        Opportunity[] memory allOps = new Opportunity[](nextId);
        for (uint256 i = 0; i < nextId; i++) {
            allOps[i] = opportunities[i];
        }
        return allOps;
    }
}
