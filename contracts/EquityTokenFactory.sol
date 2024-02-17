// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


import {EquityToken} from "./EquityToken.sol";


contract EquityTokenFactory is Ownable {
    address public tokenImplementation;

    error AddressZero();

    error AddressIsNotContract();

    event EquityTokenCreated(address indexed token, address indexed implementation, address indexed owner);
    event TokenImplementationChanged(address indexed oldImplementation, address indexed newImplementation);

    constructor(address _tokenImplementation) {
        if (_tokenImplementation == address(0)) revert AddressZero();

        tokenImplementation = _tokenImplementation;
    }

    function createToken(
        string memory _name,
        string memory _symbol,
        address _tokenOwner
    ) external onlyOwner returns (address token) {
        if (_tokenOwner == address(0)) revert AddressZero();
 

        token = Clones.clone(tokenImplementation);
        EquityToken(token).initialize(_name, _symbol, _tokenOwner);
        emit EquityTokenCreated(token, tokenImplementation, _tokenOwner);
    }

    function setTokenImplementation(address newImplementation) external onlyOwner {
        _setTokenImplementation(newImplementation);
    }

    function _setTokenImplementation(address _newImplementation) internal {
        if (_newImplementation == address(0)) revert AddressZero();
  
        address _oldImplementation = tokenImplementation;
        tokenImplementation = _newImplementation;
        emit TokenImplementationChanged(_oldImplementation, _newImplementation);
    }

}