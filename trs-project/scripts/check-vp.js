const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    const USER_ADDRESS = "0x07D3cC2f780fEe6969814E53441cb27054e39E4b";

    console.log("Checking VP for:", USER_ADDRESS);

    const Governor = await hre.ethers.getContractFactory("TRSGovernor");
    const gov = Governor.attach(GOVERNOR_ADDRESS);

    const Token = await hre.ethers.getContractFactory("TRSToken");
    // Get token address from governor
    const tokenAddress = await gov.token();
    const token = Token.attach(tokenAddress);

    const currentBlock = await hre.ethers.provider.getBlockNumber();
    console.log("Current Block:", currentBlock);

    // Check Threshold
    const threshold = await gov.proposalThreshold();
    console.log("Proposal Threshold:", hre.ethers.formatEther(threshold), "TRS");

    // Check User Votes
    const currentVotes = await token.getVotes(USER_ADDRESS);
    console.log("Current Votes:", hre.ethers.formatEther(currentVotes), "TRS");

    // Check User Past Votes (what Governor sees)
    // Governor typically checks block.number - 1
    const pastVotes = await token.getPastVotes(USER_ADDRESS, currentBlock - 1);
    console.log(`Votes at Block ${currentBlock - 1}:`, hre.ethers.formatEther(pastVotes), "TRS");

    if (currentVotes > threshold) {
        if (pastVotes <= threshold) {
            console.log("CONCLUSION: User needs to wait 1 more block. VP is updated but not checkpointed in the past.");
        } else {
            console.log("CONCLUSION: VP is sufficient. Logic mismatch?");
        }
    } else {
        console.log("CONCLUSION: VP is strictly below threshold.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
