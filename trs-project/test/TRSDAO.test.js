const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");

describe("TRS DAO End-to-End", function () {
    let token, timelock, governor, kycRegistry, sale, splitter;
    let owner, founder, voter, guest, treasury, unauthorized;
    let kycedFounder, kycedVoter, kycedGuest; // Signers

    const MAX_WALLET = ethers.parseEther("47999");
    const FOUNDER_REQ = ethers.parseEther("24000");
    const PROPOSAL_THRESHOLD = ethers.parseEther("24000");

    before(async function () {
        [owner, founder, voter, guest, treasury, unauthorized] = await ethers.getSigners();
    });

    it("Should deploy all contracts correctly", async function () {
        // 1. Deploy KYC Registry
        const KYC = await ethers.getContractFactory("KYCRegistry");
        kycRegistry = await KYC.deploy(owner.address);
        // await kycRegistry.deployed(); // Ethers v6 doesn't use .deployed(), it awaits the contract object? No, await factory.deploy() returns contract. 
        // In Hardhat ethers v6, waitForDeployment() is standard.
        await kycRegistry.waitForDeployment();

        // 2. Deploy Timelock
        // Proposers: [], Executors: [], Admin: Owner (initially)
        const Timelock = await ethers.getContractFactory("TRSTimelock");
        timelock = await Timelock.deploy(1, [], [], owner.address); // 1 sec delay for testing
        await timelock.waitForDeployment();

        // 3. Deploy Token
        const Token = await ethers.getContractFactory("TRSToken");
        token = await Token.deploy(timelock.target, timelock.target); // Timelock owns token & is treasury (simplified)
        await token.waitForDeployment();

        // 4. Deploy Governor
        const Governor = await ethers.getContractFactory("TRSGovernor");
        // _token, _timelock, _kyc, _delay, _period, _threshold
        governor = await Governor.deploy(
            token.target,
            timelock.target,
            kycRegistry.target,
            0, // 0 block delay
            50, // 50 block period (~10 mins)
            PROPOSAL_THRESHOLD
        );
        await governor.waitForDeployment();

        // 5. Deploy Sale
        const Sale = await ethers.getContractFactory("TRSSale");
        sale = await Sale.deploy(token.target, timelock.target);
        await sale.waitForDeployment();

        // 6. Deploy Splitter Helper (for later)
        const Splitter = await ethers.getContractFactory("FounderSplitter");
        splitter = await Splitter.deploy([founder.address], [100]);
        await splitter.waitForDeployment();

        // Setup Roles
        const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
        const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
        const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

        // Grant Owner roles for setup
        await timelock.connect(owner).grantRole(PROPOSER_ROLE, owner.address);
        await timelock.connect(owner).grantRole(EXECUTOR_ROLE, owner.address);

        await timelock.connect(owner).grantRole(PROPOSER_ROLE, governor.target);
        await timelock.connect(owner).revokeRole(EXECUTOR_ROLE, ethers.ZeroAddress); // Remove open execution
        await timelock.connect(owner).grantRole(EXECUTOR_ROLE, founder.address);

        // Whitelist Sale contract in Token (to dispense tokens > max limit logic if needed? No, Sale doesn't hold tokens usually, Treasury does)
        // Actually, TRSSale transfers FROM Treasury.
        // So Treasury (Timelock) needs to approve Sale.
        // Access control: Timelock is the owner.
        // We need to execute a transaction via Timelock to approve the Sale? 
        // Or, since we (owner) passed Timelock as Treasury, the Token minted 1B to Timelock.
        // Timelock is just a contract. It can't call 'approve' easily without a proposal.
        // CRITICAL: We need to get tokens OUT of the Timelock for the Sale to work.
        // For testing simplicity, let's assume we can use the TimelockAdmin to queue an approve call?
        // Or, wait: TRSToken constructor minted to 'treasury'.
        // If 'treasury' is the Timelock, only a proposal can move funds.
        // This creates a chicken-and-egg for the *Initial* setup unless we have an admin role or pre-mint to a setup wallet.
        // FIX: For this test, let's execute a Timelock transaction (as admin) to Approve the Sale contract.

        // Grant Admin to Owner temporarily to schedule batch (it is already)
        const transferCalldata = token.interface.encodeFunctionData("approve", [sale.target, ethers.MaxUint256]);
        await timelock.connect(owner).scheduleBatch(
            [token.target],
            [0],
            [transferCalldata],
            ethers.ZeroHash,
            ethers.ZeroHash,
            1 // delay
        );
        await time.increase(2);
        await timelock.connect(owner).executeBatch(
            [token.target],
            [0],
            [transferCalldata],
            ethers.ZeroHash,
            ethers.ZeroHash
        );

        // Whitelist Sale and Timelock from MaxWallet is handled in constructor?
        // Timelock address was passed as treasury -> Excluded.
        // Sale address was NOT passed. We need to exclude Sale.
        // But Token Owner is Timelock now (constructor xfer).
        // So excluding Sale requries a Proposal.
        // Oh, TRSToken owner is 'initialOwner'. Passed as 'timelock.target'?
        // "transferOwnership(initialOwner)".
        // If I passed timelock.target, then Timelock owns it.
        // I should have passed 'owner' first, done setup, then transferred to Timelock.
        // Too late for constructor change without redeploy.
        // Let's do the Proposal dance or use the Timelock scheduleBatch again since Owner is Timelock Admin.

        const excludeCalldata = token.interface.encodeFunctionData("setExcludedFromMaxWallet", [sale.target, true]);
        await timelock.connect(owner).scheduleBatch(
            [token.target],
            [0],
            [excludeCalldata],
            ethers.ZeroHash,
            ethers.id("excludeSale"),
            1
        );
        await time.increase(2);
        await timelock.connect(owner).executeBatch(
            [token.target],
            [0],
            [excludeCalldata],
            ethers.ZeroHash,
            ethers.id("excludeSale")
        );
    });

    describe("Token & Sale", function () {
        it("Should fail if wallet limit enforced", async function () {
            // Price is 0.00001 ETH
            // 48,000 Tokens cost ~0.48 ETH.
            // Try to buy 48,000 ETH worth tokens -> 48,000 * 10^18 units.
            // Limit is 47,999.

            await sale.connect(guest).buyTokens({ value: ethers.parseEther("0.1") }); // 10,000 tokens
            expect(await token.balanceOf(guest.address)).to.equal(ethers.parseEther("10000"));

            // Try buying 40,000 more (Total 50,000) -> Should Fail
            await expect(
                sale.connect(guest).buyTokens({ value: ethers.parseEther("0.4") })
            ).to.be.revertedWith("Exceeds max wallet limit");
        });

        it("Pricing should double after 24 hours", async function () {
            const initialPrice = await sale.getCurrentPrice();
            expect(initialPrice).to.equal(ethers.parseEther("0.00001"));

            await time.increase(24 * 3600); // 24 hours

            // Trigger generic update (mining block by reading)
            const newPrice = await sale.getCurrentPrice();
            expect(newPrice).to.equal(ethers.parseEther("0.00002"));
        });
    });

    describe("KYC & Governance", function () {
        before(async function () {
            // Whitelist Founder and Voter for KYC
            await kycRegistry.connect(owner).setKYCStatus(founder.address, true);
            await kycRegistry.connect(owner).setKYCStatus(voter.address, true);

            console.log("Timelock Address:", timelock.target);
            console.log("Is Timelock Excluded?", await token.isExcludedFromMaxWallet(timelock.target));
            console.log("Is Founder Excluded?", await token.isExcludedFromMaxWallet(founder.address));

            // Give tokens to Founder (Need > 24k)
            const price = await sale.getCurrentPrice();
            const bal = await token.balanceOf(founder.address);
            console.log("Founder Balance Before:", ethers.formatEther(bal));
            console.log("Current Price:", ethers.formatEther(price));

            const cost = price * 25000n;
            console.log("Calculated Cost:", ethers.formatEther(cost));

            // Expected Amount
            // amount = cost * 10^18 / price = price * 25000 * 10^18 / price = 25000 * 10^18.

            await sale.connect(founder).buyTokens({ value: cost });
            await token.connect(founder).delegate(founder.address);
        });

        it("Should revert proposal if Proposer has No KYC", async function () {
            // Guest has tokens (10k) but no KYC
            // Even if Guest had 25k tokens:
            await sale.connect(guest).buyTokens({ value: ethers.parseEther("0.00002") }); // Just buy a bit more
            // Transferring to reach 24k might fail due to wallet limit if we aren't careful, but Guest has ~10k.
            // Let's just create a new non-kyc user 'unauthorized' with tokens?
            // Hard to give 'unauthorized' tokens without buying or transfer (checked by max wallet).
            // Let's use 'guest'. Guest has NO KYC.

            const calldata = token.interface.encodeFunctionData("transfer", [guest.address, 100]); // Dummy proposal
            await expect(
                governor.connect(guest).propose(
                    [token.target], [0], [calldata], "Illegal Proposal"
                )
            ).to.be.revertedWith("Proposer must be KYC verified");
        });

        it("Should allow Proposal if Proposer Has KYC + >24k Tokens", async function () {
            expect(await token.getVotes(founder.address)).to.be.gte(FOUNDER_REQ);
            expect(await kycRegistry.isKyced(founder.address)).to.be.true;

            const transferCalldata = token.interface.encodeFunctionData("transfer", [founder.address, ethers.parseEther("100")]);

            await governor.connect(founder).propose(
                [token.target],
                [0],
                [transferCalldata],
                "Valid Proposal"
            );
        });

        it("Should prevent Voting without KYC", async function () {
            // Guest has tokens but no KYC
            await token.connect(guest).delegate(guest.address);

            // Find the proposalId?
            // We need to capture it from event or helper.
            // Let's just create a new one to be sure.
            const transferCalldata = token.interface.encodeFunctionData("transfer", [founder.address, ethers.parseEther("1")]);
            const tx = await governor.connect(founder).propose(
                [token.target], [0], [transferCalldata], "Vote Test"
            );
            const receipt = await tx.wait();
            // Proposal ID logic ... normally emitted.
            // Using helper:
            const proposalId = await governor.hashProposal(
                [token.target], [0], [transferCalldata], ethers.id("Vote Test")
            );

            await mine(2); // Advance delay

            await expect(
                governor.connect(guest).castVote(proposalId, 1) // For
            ).to.be.revertedWith("Voter must be KYC verified");
        });

        it("Should prevent Voting if < 12k tokens (Member Tier)", async function () {
            const transferCalldata = token.interface.encodeFunctionData("transfer", [founder.address, ethers.parseEther("1")]);
            const proposalId = await governor.hashProposal(
                [token.target], [0], [transferCalldata], ethers.id("Vote Test")
            );

            // Voter buys 11,999 tokens (Member Tier)
            // Need accurate price calc again or rough estimate if price is low
            const price = await sale.getCurrentPrice();
            const cost = price * 11999n;

            await sale.connect(voter).buyTokens({ value: cost });
            await token.connect(voter).delegate(voter.address);

            await expect(
                governor.connect(voter).castVote(proposalId, 1)
            ).to.be.revertedWith("Must have Voter Tier (12k TRS)");
        });

        it("Should allow Voting with KYC + 12k Tokens (Voter Tier)", async function () {
            // Voter buys MORE tokens to reach 12,000
            const price = await sale.getCurrentPrice();
            await sale.connect(voter).buyTokens({ value: ethers.parseEther("0.1") });
            await token.connect(voter).delegate(voter.address);

            expect(await token.getVotes(voter.address)).to.be.gte(ethers.parseEther("12000"));

            // Create NEW proposal so snapshot captures the 12k balance
            const transferCalldata = token.interface.encodeFunctionData("transfer", [founder.address, ethers.parseEther("1")]);
            const tx = await governor.connect(founder).propose(
                [token.target], [0], [transferCalldata], "Vote Test 2"
            );
            const receipt = await tx.wait();
            const proposalId2 = await governor.hashProposal(
                [token.target], [0], [transferCalldata], ethers.id("Vote Test 2")
            );

            await mine(2); // Advance delay

            await governor.connect(voter).castVote(proposalId2, 1);
        });
    });
});
