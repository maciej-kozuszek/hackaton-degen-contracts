// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
/* solhint-disable reason-string */

import "./core/BasePaymaster.sol";
import "./interfaces/IWhitelistPaymaster.sol";


contract Paymaster is IWhitelistPaymaster, BasePaymaster {
    mapping(address => bool) public senderWhitelist;
    mapping(address => bool) public targetWhitelist;

    error SenderNotExisted();
    error SenderNotWhitelisted(address);

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) { }

    function whitelistSender(address sender) external override onlyOwner {
        senderWhitelist[sender] = true;
        emit WhitelistedSenderAddressAdded(sender);
    }

    function whitelistTarget(address target) external override onlyOwner {
        targetWhitelist[target] = true;
        emit WhitelistedTargetAddressAdded(target);
    }

    function isWhitelistedTarget(address target) external view override returns (bool) {
        return targetWhitelist[target];
    }

    function isWhitelistedSender(address sender) external view override returns (bool) {
        return senderWhitelist[sender];
    }

    function validatePaymasterUserOp(UserOperation calldata userOp, bytes32 /*userOpHash*/, uint256 /*requiredPreFund*/) external view override returns (bytes memory context, uint256 validationData) {
        if (userOp.sender.code.length == 0) {
            revert SenderNotExisted();
        }

        if (!senderWhitelist[userOp.sender]) {
            revert SenderNotWhitelisted(userOp.sender);
        }

        return (new bytes(0), 0);
    }
}
