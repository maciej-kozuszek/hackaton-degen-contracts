// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20, ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract StableCoin is ERC20Permit {
    // signature data
    bytes32 private constant _INVEST_TYPEHASH =
        keccak256("InvestmentData(address investor,uint256 amountIn,uint256 amountOut,bytes32 salt)");
    string private constant _DOMAIN_NAME = "Mosaico";
    string private constant _DOMAIN_VERSION = "0.1.0";

    constructor() ERC20("TestStableCoin", "TSC") ERC20Permit("TestStableCoin") {
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }

    function mintTo(address user, uint256 amount) public {
        _mint(user, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
