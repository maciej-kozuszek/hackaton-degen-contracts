// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract StableCoin is ERC20Permit {
    constructor() ERC20("Test Stable Coin", "TSC") ERC20Permit("Test Stable Coin") {

        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    function mintTo(address user, uint256 amount) public {
        _mint(user, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
