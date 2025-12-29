const hre = require("hardhat");

async function main() {
    const GOVERNOR_ADDRESS = "0x94eeA841bb375d90f0eaD499aD4191A0F8d47C9B";
    const gov = await hre.ethers.getContractAt("TRSGovernor", GOVERNOR_ADDRESS);

    const currentBlock = await hre.ethers.provider.getBlockNumber();
    const filter = gov.filters.ProposalCreated();
    const events = await gov.queryFilter(filter, currentBlock - 5000, currentBlock);

    if (events.length === 0) return;

    const lastProposal = events[events.length - 1];
    const calldatas = lastProposal.args[4];

    console.log("Calldata Array:", calldatas);

    if (calldatas.length > 0) {
        if (calldatas[0] === '0x') {
            console.log("Calldata is EMPTY (0x). This transaction sends 0 ETH to the target with NO function call.");
        } else {
            console.log("Calldata is PRESENT. User tried to execute a function.");
            // Attempt to decode transfer header
            if (calldatas[0].startsWith("0xa9059cbb")) {
                console.log("Function Signature matches 'transfer(address,uint256)'");
            }
        }
    }
}

main().catch(console.error);
