'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useWallet() {
    const [account, setAccount] = useState<string>('');
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [chainId, setChainId] = useState<string>('');

    useEffect(() => {
        if (window.ethereum) {
            const p = new ethers.BrowserProvider(window.ethereum);
            setProvider(p);

            // Check if already connected
            p.listAccounts().then(accounts => {
                if (accounts.length > 0) {
                    setAccount(accounts[0].address);
                    p.getSigner().then(setSigner);
                }
            });

            // Listen for changes
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                setAccount(accounts[0] || '');
                if (accounts.length > 0) p.getSigner().then(setSigner);
                else setSigner(null);
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }
    }, []);

    async function connect() {
        if (!window.ethereum) return alert("Install MetaMask");
        const p = new ethers.BrowserProvider(window.ethereum);
        const accounts = await p.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        const s = await p.getSigner();
        setSigner(s);
    }

    return { account, provider, signer, connect };
}
