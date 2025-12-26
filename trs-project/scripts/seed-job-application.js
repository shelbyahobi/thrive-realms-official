const hre = require("hardhat");

async function main() {
    const JOB_REGISTRY = "0x1fD9aB8418fF4D9196a92A4afe3A93cca148674D";
    const TOKEN_ADDRESS = "0xEa718B043f32b4C78616AD90375C46667ea130D3";

    const [founder] = await hre.ethers.getSigners();

    // Create Random Applicant
    const applicant = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);

    console.log("--- Seeding Verification Test Data ---");
    console.log("Founder:", founder.address);
    console.log("Applicant:", applicant.address);

    const JobRegistry = await hre.ethers.getContractFactory("JobRegistry");
    const contract = JobRegistry.attach(JOB_REGISTRY);

    // 1. Post a Job (Founder)
    console.log("\n1. Posting Job...");
    const tx1 = await contract.connect(founder).postJob(
        1,
        "UI Redesign|Redesign the landing page|React",
        hre.ethers.parseEther("5000"),
        TOKEN_ADDRESS
    );
    await tx1.wait();
    console.log("Job Posted!");

    // Get Job ID
    const nextId = await contract.nextJobId();
    const jobId = Number(nextId) - 1;
    console.log("Job ID:", jobId);

    // 2. Fund Applicant (BNB for Gas + TRS for Tier)
    console.log("\n2. Funding Applicant...");

    // Send 0.01 BNB
    const txEth = await founder.sendTransaction({
        to: applicant.address,
        value: hre.ethers.parseEther("0.01")
    });
    await txEth.wait();
    console.log("Sent 0.01 BNB for gas.");

    // Send 2000 TRS
    const TRSToken = await hre.ethers.getContractFactory("TRSToken");
    const token = TRSToken.attach(TOKEN_ADDRESS);
    const txToken = await token.connect(founder).transfer(applicant.address, hre.ethers.parseEther("2000"));
    await txToken.wait();
    console.log("Sent 2000 TRS (Tier 1).");

    // 3. Apply for Job (Applicant)
    console.log("\n3. Applying for Job...");
    const tx3 = await contract.connect(applicant).applyForJob(jobId, "Mock Applicant here.");
    await tx3.wait();
    console.log("Application Submitted!");

    console.log("\n--- READY FOR UI TESTING ---");
    console.log("1. Go to: /jobs/" + jobId);
    console.log("2. You will see applicant: " + applicant.address);
    console.log("3. Status: Pending Verification (Yellow Shield)");
    console.log("4. Copy this Applicant Address.");
    console.log("5. Go to /verify -> Paste Address -> Click Verify.");
    console.log("6. Go back to Job -> Assign -> Complete.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
