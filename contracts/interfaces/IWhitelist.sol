// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IWhitelist {
    event AddToWhitelist(address indexed _address);
    event RemoveFromWhitelist(address indexed _address);

    function addToWhitelist(address _address) external;

    function removeFromWhitelist(address _address) external;
}
