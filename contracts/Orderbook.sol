// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";

import {PermitExecutor} from "./PermitExecutor.sol";
import {IOrderbook} from "./interfaces/IOrderbook.sol";

contract Orderbook is IOrderbook, PermitExecutor, AccessControlUpgradeable, PausableUpgradeable {
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    address stablecoin;

    uint256 orderLength;
    mapping(uint256 => Order) orders;

    // mapping(address => uint256) private stableCoinBalance;
    mapping(address => uint256) private equityTokenOwnerShipAmount;
    mapping(uint256 => address) private orderToOwner;

    uint256 public totalFee;

    modifier onlyOrderOwner(uint256 _orderId) {
        if (msg.sender != orderToOwner[_orderId]) {
            revert InvalidTokOwner();
        }
        _;
    }

    modifier onlyEquityTokenOwner(uint256 _orderId) {
        if (msg.sender != orders[_orderId].equityTokenOwner) {
            revert InvalidTokOwner();
        }

        _;
    }

    modifier onlyValidState(uint256 _orderId, State _state) {
        if (orders[_orderId].currentState != _state) {
            revert InvalidState();
        }

        _;
    }

    modifier notPaused() {
        if (paused()) revert OrderbookPaused();
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _stablecoinAddress) public initializer {
        __AccessControl_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(OWNER_ROLE, _msgSender());
        _grantRole(MINTER_ROLE, _msgSender());
        stablecoin = _stablecoinAddress;
    }

    function getOrderOwner(uint256 orderId) external view returns (address) {
        return orderToOwner[orderId];
    }

    function pause() public onlyRole(OWNER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(OWNER_ROLE) {
        _unpause();
    }

    function getStablecoinBalance(address _account) public view returns (uint256) {
        return ERC20Upgradeable(stablecoin).balanceOf(_account);
    }

    function getEquityTokenOwnerShipAmount(address ownerAddress) external view returns (uint256) {
        return equityTokenOwnerShipAmount[ownerAddress];
    }

    function createOrder(
        address _buyer,
        uint256 _price,
        address _tokenAddress,
        uint256 _tokenAmount,
        address _owner,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external notPaused {
        orders[orderLength] = Order(_tokenAddress, _owner, _price, _tokenAmount, 0, State.Created, false);

        orderToOwner[orderLength] = _owner;
        uint256 totalOrderAmount = _tokenAmount * _price;
        _transferStablecoinWithPermit(stablecoin, _buyer, address(this), totalOrderAmount, deadline, v, r, s);

        emit NewOrderEvent(orderLength, totalOrderAmount, _tokenAddress, _tokenAmount);
    }

    function cancelOrderByOwner(
        uint256 _orderId
    ) external onlyOrderOwner(_orderId) onlyValidState(_orderId, State.Created) notPaused {
        orders[_orderId].currentState = State.OrderOwnerCancelled;

        emit CancelOrderByOwnerEvent(orders[_orderId].equityToken, _orderId);
    }

    function changeOrderByOwner(
        uint256 _orderId,
        address _tokenAddress
    ) external onlyOrderOwner(_orderId) onlyValidState(_orderId, State.Created) notPaused {
        orders[_orderId].currentState = State.OrderOwnerChanged;
        orders[_orderId].equityToken = _tokenAddress;

        emit ChangeOrderByOwnerEvent(
            orders[_orderId].equityToken,
            orders[_orderId].pricePerToken,
            orders[_orderId].totalOrderAmount
        );
    }

    function runCancelOrderByOwner(uint256 _orderId) external {
        _runCancelOrderByOwner(_orderId);
    }

    function runChangeOrderByOwner(
        uint256 _orderId
    ) external onlyRole(OWNER_ROLE) onlyValidState(_orderId, State.OrderOwnerChanged) {
        orders[_orderId].currentState = State.Created;

        emit RunChangeOrderByOwnerEvent(_orderId);
    }

    function _runCancelOrderByOwner(
        uint256 _orderId
    ) internal onlyRole(OWNER_ROLE) onlyValidState(_orderId, State.OrderOwnerCancelled) {
        uint256 packageAmountPrice = orders[_orderId].totalOrderAmount * orders[_orderId].pricePerToken;
        address orderOwner = orderToOwner[_orderId];
        require(getStablecoinBalance(orderOwner) >= packageAmountPrice, "TOK: insufficient balance");
        orders[_orderId].currentState = State.Removed;
        IERC20Upgradeable(orders[_orderId].equityToken).transfer(orderOwner, packageAmountPrice);

        emit RunCancelOrderByOwnerEvent(orders[_orderId].equityToken, _orderId);
    }

    function cancelOrderByTokenOwner(
        uint256 _orderId
    ) external onlyEquityTokenOwner(_orderId) onlyValidState(_orderId, State.OwnerApproved) notPaused {
        orders[_orderId].currentState = State.TokenOwnerCancelled;

        emit CancelOrderByTokenOwnerEvent(orders[_orderId].equityToken, _orderId);
    }

    function runCancelOrderByTokenOwner(uint256 _orderId) external {
        _runCancelOrderByTokenOwner(_orderId);
    }

    function _runCancelOrderByTokenOwner(
        uint256 _orderId
    ) internal onlyRole(OWNER_ROLE) onlyValidState(_orderId, State.TokenOwnerCancelled) {
        require(
            equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] >= orders[_orderId].equityTokenAmount,
            "TOK: insufficient EquityToken amount"
        );
        require(orders[_orderId].equityTokenOwner != address(this), "TOK: contarct is a token owner");
        equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] =
            equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] -
            orders[_orderId].equityTokenAmount;
        orders[_orderId].currentState = State.Created;
        address equityTokenOwner = orders[_orderId].equityTokenOwner;
        orders[_orderId].equityTokenOwner = address(this);
        uint256 equityTokenAmount = orders[_orderId].equityTokenAmount;
        orders[_orderId].equityTokenAmount = 0;
        IERC20Upgradeable(orders[_orderId].equityToken).transfer(equityTokenOwner, equityTokenAmount);

        emit RunCancelOrderByTokenOwnerEvent(orders[_orderId].equityToken, _orderId);
    }

    function _withdrawOrder(uint256 _orderId) internal {
        require(orders[_orderId].currentState == State.Created, "TOK: order is not in Created state");
        orders[_orderId].currentState = State.OrderOwnerCancelled;
        _runCancelOrderByOwner(_orderId);
    }

    function _withdrawToken(uint256 _orderId) internal {
        require(
            orders[_orderId].currentState == State.PpraApproved || orders[_orderId].currentState == State.OwnerApproved,
            "TOK: order is not in PpraApproved or OwnerApproved state"
        );
        orders[_orderId].currentState = State.TokenOwnerCancelled;
        _runCancelOrderByTokenOwner(_orderId);
    }

    function _unlockTransaction(uint256 _orderId) internal onlyValidState(_orderId, State.PpraApproved) {
        orders[_orderId].currentState = State.OwnerApproved;
    }

    function transact(
        uint256 _orderId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external onlyValidState(_orderId, State.PpraApproved) {
        address newOwner = orderToOwner[_orderId];
        require(
            getStablecoinBalance(newOwner) >= orders[_orderId].pricePerToken,
            "TOK: insufficient StableCoin balance"
        );
        require(
            equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] >= orders[_orderId].equityTokenAmount,
            "TOK: insufficient EquityToken amount"
        );
        require(
            orders[_orderId].totalOrderAmount >= orders[_orderId].equityTokenAmount,
            "Insufficient EquityToken amount in order"
        );
        uint256 packageAmountPrice = orders[_orderId].equityTokenAmount * orders[_orderId].pricePerToken;

        equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] =
            equityTokenOwnerShipAmount[orders[_orderId].equityTokenOwner] -
            orders[_orderId].equityTokenAmount;
        uint256 amount;
        uint256 fee;
        if (orders[_orderId].ppraFee) {
            amount = (packageAmountPrice * 7) / 10;
            fee = packageAmountPrice - amount;
            totalFee = totalFee + fee;
        } else {
            amount = packageAmountPrice;
        }
        orders[_orderId].totalOrderAmount = orders[_orderId].totalOrderAmount - orders[_orderId].equityTokenAmount;
        if (orders[_orderId].totalOrderAmount == 0) {
            orders[_orderId].currentState = State.Done;
        } else {
            orders[_orderId].currentState = State.Created;
            orders[_orderId].ppraFee = true;
            orders[_orderId].equityTokenOwner = address(this);
            orders[_orderId].equityTokenAmount = 0;
        }

        // transfer stablecoin: this -> equityTokenOwner
        IERC20Upgradeable(stablecoin).transfer(orders[_orderId].equityTokenOwner, amount);
        // transfer equityToken with permit: equityTokenOwner -> newOwner
        _transferEquityTokenWithPermit(
            orders[_orderId].equityToken,
            orders[_orderId].equityTokenOwner,
            newOwner,
            amount,
            deadline,
            v,
            r,
            s
        );

        emit TransactEvent(
            orders[_orderId].equityToken,
            _orderId,
            orders[_orderId].equityTokenOwner,
            newOwner,
            orders[_orderId].ppraFee,
            amount,
            fee
        );
    }

    function lockTransaction(
        uint256 _orderId,
        bool _ppraFee
    ) external onlyRole(OWNER_ROLE) onlyValidState(_orderId, State.OwnerApproved) {
        orders[_orderId].ppraFee = _ppraFee;
        orders[_orderId].currentState = State.PpraApproved;

        emit LockTransactionEvent(_orderId);
    }
}
