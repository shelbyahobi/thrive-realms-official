// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TRSToken.sol"; 
import "./ExecutionRegistry.sol";
import "./CompanyRegistry.sol"; // Added Import

contract JobRegistry is Ownable {
    
    TRSToken public token;
    ExecutionRegistry public executionRegistry;
    CompanyRegistry public companyRegistry; // Added Reference

    enum JobStatus { Open, Filled, Completed, Cancelled }

    struct Job {
        uint256 id;
        address poster;
        uint256 proposalId; // Linked Governance Proposal
        string metadataURI; // Title, Desc, Skills
        uint256 budget;
        address paymentToken; // Address of token (TRS or Stable)
        JobStatus status;
        address executor;
        uint256 postedAt;
    }

    struct Application {
        uint256 jobId;
        address applicant;
        string metadataURI; // Cover letter, portfolio link
        uint256 tier; // 0=Guest, 1=Member, 2=Voter, 3=Founder
        uint256 timestamp;
    }

    uint256 public nextJobId = 1;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application[]) public jobApplications;
    mapping(address => uint256[]) public myJobs; // Posted by user
    mapping(address => uint256[]) public myApplications; // Applied by user

    event JobPosted(uint256 indexed jobId, address indexed poster, uint256 proposalId);
    event Applied(uint256 indexed jobId, address indexed applicant, uint256 tier);
    event ExecutorAssigned(uint256 indexed jobId, address indexed executor);
    event JobCompleted(uint256 indexed jobId, address indexed executor);

    constructor(address _tokenAddress, address _executionRegistry, address _companyRegistry) Ownable() {
        token = TRSToken(_tokenAddress);
        executionRegistry = ExecutionRegistry(_executionRegistry);
        companyRegistry = CompanyRegistry(_companyRegistry);
    }

    // Tier Logic
    function getTier(address account) public view returns (uint256) {
        uint256 balance = token.balanceOf(account);
        uint256 decimals = token.decimals();
        
        if (balance >= 24000 * 10**decimals) return 3; // Founder
        if (balance >= 12000 * 10**decimals) return 2; // Voter
        if (balance >= 1200 * 10**decimals) return 1;  // Member
        return 0; // Guest
    }

    function postJob(uint256 _proposalId, string memory _metadataURI, uint256 _budget, address _paymentToken) external {
        // Permission Check: Founder OR Verified Company
        bool isFounder = getTier(msg.sender) >= 3;
        bool isVerifiedCompany = companyRegistry.isVerified(msg.sender);
        
        require(isFounder || isVerifiedCompany, "Must be Founder or Verified Company");

        jobs[nextJobId] = Job({
            id: nextJobId,
            poster: msg.sender,
            proposalId: _proposalId,
            metadataURI: _metadataURI,
            budget: _budget,
            paymentToken: _paymentToken,
            status: JobStatus.Open,
            executor: address(0),
            postedAt: block.timestamp
        });

        myJobs[msg.sender].push(nextJobId);
        emit JobPosted(nextJobId, msg.sender, _proposalId);
        nextJobId++;
    }

    function applyForJob(uint256 _jobId, string memory _metadataURI) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job not open");
        require(job.poster != msg.sender, "Cannot apply to own job");

        uint256 tier = getTier(msg.sender);
        require(tier >= 1, "Must be at least a Member (1200 TRS) to apply");

        jobApplications[_jobId].push(Application({
            jobId: _jobId,
            applicant: msg.sender,
            metadataURI: _metadataURI,
            tier: tier,
            timestamp: block.timestamp
        }));

        myApplications[msg.sender].push(_jobId);
        emit Applied(_jobId, msg.sender, tier);
    }

    function assignExecutor(uint256 _jobId, address _executor) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.poster, "Only poster can assign");
        require(job.status == JobStatus.Open, "Job not open");

        job.executor = _executor;
        job.status = JobStatus.Filled;
        
        emit ExecutorAssigned(_jobId, _executor);
    }

    function completeJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.poster, "Only poster can complete");
        require(job.status == JobStatus.Filled, "Job not filled");
        
        // EXECUTION VERIFICATION CHECK
        // Payout Requirement: Executor must be verified
        require(executionRegistry.isVerified(job.executor), "Executor NOT Verified. Cannot complete/pay.");

        job.status = JobStatus.Completed;
        emit JobCompleted(_jobId, job.executor);
    }

    function getJob(uint256 _id) external view returns (Job memory) {
        return jobs[_id];
    }
    
    function getJobApplications(uint256 _id) external view returns (Application[] memory) {
        return jobApplications[_id];
    }
}
