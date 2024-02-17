// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

interface IWhitelistPaymaster {
    event WhitelistedSenderAddressAdded(address addr);
    event WhitelistedSenderAddressRemoved(address addr);

    event WhitelistedTargetAddressAdded(address addr);
    event WhitelistedTargetAddressRemoved(address addr);

    event Accepted(address indexed onBehlafOf, address indexed to, uint256 gas);

    function whitelistSender(address) external;
    function whitelistTarget(address) external;

    function isWhitelistedTarget(address target) external view returns (bool);
    function isWhitelistedSender(address sender) external view returns (bool);
}