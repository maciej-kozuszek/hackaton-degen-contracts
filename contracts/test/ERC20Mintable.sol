// SPDX-License-Identifier: UNLICENSED
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

pragma solidity ^0.8.18;

// import "hardhat/console.sol";

contract TestToken is ERC20 {
    constructor() ERC20("fake", "fake") {}

    function mintTo(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
