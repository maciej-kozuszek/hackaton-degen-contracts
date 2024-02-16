// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StableCoin is ERC20 {
    constructor() ERC20("Stable coin", "STABLE") {
        _mint(msg.sender, 10_000_000 * 10 ** decimals());
    }
}

