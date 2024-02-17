// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {IEquityToken} from "./interfaces/IEquityToken.sol";
import {Whitelist} from "./Whitelist.sol";

contract EquityToken is
    IEquityToken,
    Initializable,
    ERC20PermitUpgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    Whitelist
{
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    modifier notPaused() {
        if (paused()) revert TokenPaused();
        _;
    }

    function initialize(string memory _name, string memory _symbol) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Permit_init(_name);
        __ERC20Pausable_init();
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OWNER_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
    }

    function pause() external onlyRole(OWNER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(OWNER_ROLE) {
        _unpause();
    }

    function createShares(address _customer, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _mint(_customer, _amount);
    }
    function burnShares(address _customer, uint256 _amount) external onlyRole(MINTER_ROLE) {
        _burn(_customer, _amount);
    }

    function addToWhitelist(address _address) external override onlyRole(OWNER_ROLE) {
        _addToWhitelist(_address);
    }

    function removeFromWhitelist(address _address) external override onlyRole(OWNER_ROLE) onlyWhitelisted(_address) {
        _removeFromWhitelist(_address);
    }

    function __ERC20Pausable_init() internal onlyInitializing {
        __Pausable_init_unchained();
    }

    function __ERC20Pausable_init_unchained() internal onlyInitializing {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override notPaused onlyWhitelisted(to) {
        super._beforeTokenTransfer(from, to, amount);
    }

    uint256[50] private __gap;
}