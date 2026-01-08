// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TRSSale is ReentrancyGuard, Ownable {
    IERC20 public token;
    address public treasury;

    uint256 public constant INITIAL_PRICE = 0.00001 ether; // 0.00001 BNB
    uint256 public constant MAX_PRICE = 0.1 ether;         // 0.1 BNB
    uint256 public constant DOUBLING_PERIOD = 24 hours;

    uint256 public saleStartTime;
    bool public saleStarted;
    bool public saleEnded;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 price);
    event SaleStarted(uint256 timestamp);
    event SaleEnded(uint256 timestamp, uint256 finalPrice);

    constructor(address _token, address _treasury) Ownable() {
        token = IERC20(_token);
        treasury = _treasury;
    }

    function getCurrentPrice() public view returns (uint256) {
        if (saleEnded) return MAX_PRICE; 
        if (!saleStarted) return INITIAL_PRICE;
        
        // Safety check to prevent underflow if timestamp is manipulated by miners slightly
        if (block.timestamp < saleStartTime) return INITIAL_PRICE;

        uint256 timeElapsed = block.timestamp - saleStartTime;
        uint256 intervals = timeElapsed / DOUBLING_PERIOD;
        
        // Cap intervals to prevent overflow (though Solidity 0.8+ is safe) and massive gas
        if (intervals > 20) intervals = 20;

        uint256 currentPrice = INITIAL_PRICE * (2 ** intervals);

        if (currentPrice >= MAX_PRICE) {
            return MAX_PRICE;
        }
        return currentPrice;
    }

    function startSale() external onlyOwner {
        require(!saleStarted, "Sale already started");
        saleStarted = true;
        saleStartTime = block.timestamp;
        emit SaleStarted(saleStartTime);
    }

    function buyTokens() public payable nonReentrant {
        require(saleStarted, "Sale not started");
        require(!saleEnded, "Sale ended");
        require(msg.value > 0, "Send BNB");

        uint256 price = getCurrentPrice();
        
        // Check if we hit the cap logic
        // If price is at MAX_PRICE, we just let them buy at MAX_PRICE until we decide to end it or supply runs out
        // The previous logic REVERTED here, which was wrong.
        
        uint256 amount = (msg.value * 10**18) / price; // Assuming 18 decimals
        require(amount > 0, "Too small BNB");

        // Check Max Wallet Limit (Read-only check before fail)
        require(token.balanceOf(msg.sender) + amount <= 47999 * 10**18, "Exceeds max wallet limit");

        // Forward BNB to Treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "BNB transfer failed");

        // Transfer TRS from Sale Contract Inventory to Buyer
        bool tokenSuccess = token.transfer(msg.sender, amount);
        require(tokenSuccess, "Token transfer failed");

        emit TokensPurchased(msg.sender, amount, price);
    }

    function finalizeSale() external onlyOwner {
        require(!saleEnded, "Already ended");
        saleEnded = true;
        
        // Recover unsold tokens to Treasury is NOT needed because tokens are PULLED from Treasury via transferFrom
        // However, if the contract held any tokens itself (e.g. accidental sends), we can sweep them.
        uint256 balance = token.balanceOf(address(this));
        if (balance > 0) {
            token.transfer(treasury, balance);
        }
        
        emit SaleEnded(block.timestamp, getCurrentPrice());
    }
}
