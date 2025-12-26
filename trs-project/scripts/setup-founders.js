const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Setting up Founders with account:", deployer.address);

    // --- CONFIGURATION ---
    const founders = [
        { address: deployer.address, share: 100 }
    ];

    const KYC_ADDRESS = "0x25b5508F83DfFa70EF8e0551f7b9fdeCB1140C78"; // New Address
    console.log("Batch Verifying KYC...");

    const KYC = await hre.ethers.getContractFactory("KYCRegistry");
    const kyc = KYC.attach(KYC_ADDRESS);

    if ((await kyc.owner()) !== deployer.address) {
        console.warn("⚠️ WARNING: Deployer is not KYC Registry owner.");
    } else {
        const payees = founders.map(f => f.address);
        const tx = await kyc.setKYCStatusBatch(payees, true);
        await tx.wait();
        console.log("✅ Founders successfully KYC'd:", payees);
    }

    console.log("\n🎉 Founder Setup Complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
