// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IWhitelist} from "./interfaces/IWhitelist.sol";

abstract contract Whitelist is IWhitelist {
    mapping(address => bool) private _allowedList;
    error AddressNotWhitelisted(address to);

    modifier onlyWhitelisted(address _address) {
        if (!isWhitelisted(_address)) revert AddressNotWhitelisted(_address);
        _;
    }

    function _addToWhitelist(address _address) internal {
        _allowedList[_address] = true;
        emit AddToWhitelist(_address);
    }

    function _removeFromWhitelist(address _address) internal {
        _allowedList[_address] = false;
        emit RemoveFromWhitelist(_address);
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return _allowedList[_address];
    }
}
