const hre = require("hardhat");

async function main() {
    const KYC_ADDRESS = "0x1546FCf925844b4a659C05785bcF5932E4EaE7aF"; // Deployed Address
    const targetAddress = process.env.TARGET_USER || (await hre.ethers.getSigners())[0].address;

    console.log("Setting KYC status for:", targetAddress);

    const KYCRegistry = await hre.ethers.getContractFactory("KYCRegistry");
    const kyc = KYCRegistry.attach(KYC_ADDRESS);

    // Check current status
    const isKyced = await kyc.isKyced(targetAddress);
    if (isKyced) {
        console.log("User is already KYC verified.");
    } else {
        console.log("Verifying user...");
        const tx = await kyc.setKYCStatus(targetAddress, true);
        await tx.wait();
        console.log("User KYC Verified successfully!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
