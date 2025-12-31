const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, '../artifacts/contracts');
const FRONTEND_ABI_DIR = path.join(__dirname, '../frontend/app/abi');

const CONTRACTS = [
    'ExecutionRegistry.sol/ExecutionRegistry.json',
    'RevenueRouter.sol/RevenueRouter.json',
    'ProjectFactory.sol/ProjectFactory.json',
    'ProjectEscrow.sol/ProjectEscrow.json',
    'PolicyRegistry.sol/PolicyRegistry.json',
    'ReputationRegistry.sol/ReputationRegistry.json',
    'OpportunityRegistry.sol/OpportunityRegistry.json',
    'TRSToken.sol/TRSToken.json',
    'TRSSale.sol/TRSSale.json',
    'TRSGovernor.sol/TRSGovernor.json',
    'DividendVault.sol/DividendVault.json',
    'GovernanceSettings.sol/GovernanceSettings.json'
];

if (!fs.existsSync(FRONTEND_ABI_DIR)) {
    fs.mkdirSync(FRONTEND_ABI_DIR, { recursive: true });
}

console.log("Copying ABIs to frontend...");

CONTRACTS.forEach(contractPath => {
    const src = path.join(ARTIFACTS_DIR, contractPath);
    const fileName = path.basename(contractPath);
    const dest = path.join(FRONTEND_ABI_DIR, fileName);

    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${fileName}`);
    } else {
        console.error(`❌ Missing ${src}`);
    }
});
