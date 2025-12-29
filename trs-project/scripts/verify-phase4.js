const hre = require("hardhat");
const { ethers } = hre;

// HARDCODED PHASE 4 ADDRESSES (FIXED)
const ADDRESSES = {
    REVENUE_ROUTER: "0xDc7E7b76AEB83E6b70169356ce4Ba8A8C6990F2a",
    EXECUTION_REGISTRY: "0x5D498Bd1372D833Bd7003eF8C0E2590ce75e42D6",
    DIVIDEND_VAULT: "0x8EFccF257A361b16805FBb12aBB80E4AF06E7758",
    TREASURY: "0x95Ff3eB798e2970E471C888fb095C496D67D7a5E"
};

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`\n--- VERIFYING PHASE 4 (FIX) ---`);
    console.log(`Executor: ${deployer.address}`);

    // --- TEST 1: REVENUE ROUTER ---
    console.log("\n[TEST 1] Revenue Router Split...");
    const Router = await ethers.getContractAt("RevenueRouter", ADDRESSES.REVENUE_ROUTER);

    // Check initial bal of DivVault
    const initialDivBal = await ethers.provider.getBalance(ADDRESSES.DIVIDEND_VAULT);
    console.log(`Initial Vault Bal: ${ethers.formatEther(initialDivBal)} BNB`);

    // Send 0.01 BNB to Router (simulating revenue)
    const amount = ethers.parseEther("0.01");

    // Wait for balance checks to be accurate
    const tx = await deployer.sendTransaction({
        to: ADDRESSES.REVENUE_ROUTER,
        value: amount
    });
    console.log(`Sent ${ethers.formatEther(amount)} BNB to Router. Tx: ${tx.hash}`);
    await tx.wait();

    // Check final bal
    const finalDivBal = await ethers.provider.getBalance(ADDRESSES.DIVIDEND_VAULT);
    const diff = finalDivBal - initialDivBal;

    // Default Split: 10% Treasury, 90% Div
    // Expected at DivVault: 0.009 BNB
    const expected = ethers.parseEther("0.009");

    // Check strict equality or near equality (gas fees don't deduct from destination, but let's be safe)
    if (diff >= expected) {
        console.log(`✅ SUCCESS: Dividend Vault received ~${ethers.formatEther(diff)} BNB`);
    } else {
        console.error(`❌ FAILED: Received ${ethers.formatEther(diff)} BNB`);
    }

    // --- TEST 2: EXECUTION REGISTRY ---
    console.log("\n[TEST 2] Entity Registration...");
    const Registry = await ethers.getContractAt("ExecutionRegistry", ADDRESSES.EXECUTION_REGISTRY);

    // Register "Test Bridge"
    // EntityType: 2 (FIAT_BRIDGE)
    const testAddr = "0x0000000000000000000000000000000000000999";
    console.log("Registering Fiat Bridge...");

    try {
        const txReg = await Registry.registerEntity(
            testAddr,
            2, // FIAT_BRIDGE
            "Thrive Bridge Alpha",
            "Switzerland",
            "ipfs://legal-doc"
        );
        await txReg.wait();

        // Precise verification
        const profile = await Registry.getEntity(testAddr);
        console.log(`Fetched Profile: Type=${profile.entityType}, Name=${profile.name}`);

        if (Number(profile.entityType) === 2 && profile.name === "Thrive Bridge Alpha") {
            console.log("✅ SUCCESS: Entity Registered correctly as FIAT_BRIDGE");
        } else {
            console.error("❌ FAILED: Profile mismatch");
        }
    } catch (e) {
        console.error("❌ FAILED: Registration Tx Error", e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
