import { ethers } from 'ethers';

// export const BSC_TESTNET_RPC = "https://data-seed-prebsc-1-s1.binance.org:8545/";
export const BSC_TESTNET_RPC = "https://bsc-testnet.publicnode.com"; // Alternative reliable node

export const getReadProvider = () => {
    return new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
};
