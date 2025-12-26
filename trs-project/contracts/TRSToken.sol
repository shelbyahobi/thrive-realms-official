// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TRSToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Votes, ERC20Snapshot, Ownable {
    uint256 public constant MAX_WALLET = 47999 * 10**18;
    mapping(address => bool) public isExcludedFromMaxWallet;

    constructor(address initialOwner, address treasury)
        ERC20("ThriveRealmsToken", "TRS")
        ERC20Permit("ThriveRealmsToken")
        Ownable()
    {
        require(initialOwner != address(0), "Invalid owner");
        require(treasury != address(0), "Invalid treasury");
        
        isExcludedFromMaxWallet[initialOwner] = true;
        isExcludedFromMaxWallet[treasury] = true;
        isExcludedFromMaxWallet[address(this)] = true;
        
        _mint(treasury, 1_000_000_000 * 10 ** decimals());
        transferOwnership(initialOwner);
    }

    function setExcludedFromMaxWallet(address account, bool excluded) external onlyOwner {
        isExcludedFromMaxWallet[account] = excluded;
    }

    function snapshot() external onlyOwner returns (uint256) {
        return _snapshot();
    }

    // Overrides

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);

        if (to != address(0) && !isExcludedFromMaxWallet[to] && !isExcludedFromMaxWallet[from]) {
            require(balanceOf(to) + amount <= MAX_WALLET, "Exceeds max wallet limit");
        }
    }

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}