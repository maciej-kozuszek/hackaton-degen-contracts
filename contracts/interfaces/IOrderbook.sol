// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IOrderbook {
    error OrderbookPaused();
    enum State {
        Created,
        OwnerApproved,
        PpraApproved,
        Hidden,
        Done,
        Removed,
        OrderOwnerCancelled,
        TokenOwnerCancelled,
        OrderOwnerChanged
    }

    struct Order {
        address equityToken;
        address equityTokenOwner;
        uint256 pricePerToken;
        uint256 totalOrderAmount;
        uint256 equityTokenAmount;
        State currentState;
        bool ppraFee;
    }
    event NewOrderEvent(
        uint256 indexed orderId,
        uint256 indexed totalOrderAmount,
        address indexed tokenAddress,
        uint256 tokenAmount
    );

    event CancelOrderByOwnerEvent(address indexed tokenAddress, uint256 indexed orderId);

    event RunCancelOrderByOwnerEvent(address indexed tokenAddress, uint256 indexed orderId);

    event CancelOrderByTokenOwnerEvent(address indexed tokenAddress, uint256 indexed orderId);

    event RunCancelOrderByTokenOwnerEvent(address indexed tokenAddress, uint256 indexed orderId);

    event RunModifyOrderByPpraEvent(address indexed tokenAddress, uint256 indexed orderId, uint256 indexed mode);

    event TransactEvent(
        address tokenAddress,
        uint256 indexed orderId,
        address indexed tokenOwner,
        address indexed newOwner,
        bool ppraFee,
        uint256 totalOrderAmount,
        uint256 fee
    );

    event DepositEquityTokenEvent(
        uint256 indexed orderId,
        address indexed clientAddress,
        uint256 indexed depositTokenAmount
    );

    event LockTransactionEvent(uint256 indexed orderId);

    event ChangeOrderByOwnerEvent(
        address indexed tokenAddress,
        uint256 indexed pricePerToken,
        uint256 indexed totalOrderAmount
    );

    event RunChangeOrderByOwnerEvent(uint256 indexed orderId);

    error InvalidTokOwner();
    error InvalidState();
}
