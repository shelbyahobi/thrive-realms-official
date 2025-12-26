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

        uint256 timeElapsed = block.timestamp - saleStartTime;
        uint256 intervals = timeElapsed / DOUBLING_PERIOD;
        
        // Safety check for overflow if intervals is huge (unlikely within reasonable time)
        if (intervals > 20) return MAX_PRICE; // 2^20 is massive multiplier

        uint256 currentPrice = INITIAL_PRICE * (2 ** intervals);

        if (currentPrice >= MAX_PRICE) {
            return MAX_PRICE;
        }
        return currentPrice;
    }

    function buyTokens() public payable nonReentrant {
        require(!saleEnded, "Sale ended");
        require(msg.value > 0, "Send BNB");

        // Trigger start on first buy
        if (!saleStarted) {
            saleStarted = true;
            saleStartTime = block.timestamp;
            emit SaleStarted(saleStartTime);
        }

        uint256 price = getCurrentPrice();
        
        // Check if we hit the cap
        if (price >= MAX_PRICE && !saleEnded) {
            saleEnded = true;
            emit SaleEnded(block.timestamp, price);
            require(price < MAX_PRICE, "Sale finished (Price reached Cap)");
        }

        uint256 amount = (msg.value * 10**18) / price; // Assuming 18 decimals
        require(amount > 0, "Too small BNB");

        // Check Max Wallet Limit (Read-only check before fail)
        require(token.balanceOf(msg.sender) + amount <= 47999 * 10**18, "Exceeds max wallet limit");

        // Forward BNB to Treasury
        (bool success, ) = treasury.call{value: msg.value}("");
        require(success, "BNB transfer failed");

        // Transfer TRS from Treasury to Buyer
        // Requires Treasury to have `approve(address(sale), amount)`
        bool tokenSuccess = token.transferFrom(treasury, msg.sender, amount);
        require(tokenSuccess, "Token transfer failed (Check allowance)");

        emit TokensPurchased(msg.sender, amount, price);
    }
}
