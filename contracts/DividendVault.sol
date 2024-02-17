// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DividendVault is Ownable {
    IERC20 stablecoin;

    event NewDividend(uint256 dividendNumber);

    constructor(IERC20 _stablecoin) {
        _transferOwnership(msg.sender);
        stablecoin = _stablecoin;
    }

    struct Dividend {
        uint256 startBlock;
        uint256 endBlock;
        uint256 amountToClaim;
        uint256 claimed;
        address creator;
        bool active;
        mapping(address => uint256) lockedSharesMapping;
    }

    mapping(address => mapping(uint256 => Dividend)) public dividends;

    function newDividend(uint256 startBlock, uint256 endBlock, address equityTokenAddress, uint256 amountToClaim) public {
        require(dividends[equityTokenAddress][block.number].active == false, "DividendVault: this dividend already exist");
        stablecoin.transferFrom(msg.sender, address(this), amountToClaim);
        dividends[equityTokenAddress][block.number].startBlock = startBlock;
        dividends[equityTokenAddress][block.number].endBlock = endBlock;
        dividends[equityTokenAddress][block.number].amountToClaim = amountToClaim;
        dividends[equityTokenAddress][block.number].claimed = 0;
        dividends[equityTokenAddress][block.number].active = true;
        dividends[equityTokenAddress][block.number].creator = msg.sender;

        emit NewDividend(block.number);
    }

    function setStablecoinAddress(IERC20 _stablecoin) public onlyOwner {
        stablecoin = _stablecoin;
    }

    function claimReward(IERC20 equityToken, uint256 dividendNumber) public {
        require(
            block.number >= dividendNumber && block.number <= dividends[address(equityToken)][dividendNumber].endBlock && dividends[address(equityToken)][dividendNumber].active == true,
            "DividendVault: This dividend ended"
        );

        uint256 equityTokenBalance = equityToken.balanceOf(msg.sender);
        require(equityTokenBalance > 0, "DividendVault: no equity token balance");

        uint256 totalSupply = equityToken.totalSupply();
        equityToken.transferFrom(msg.sender, address(this), equityTokenBalance);

        dividends[address(equityToken)][dividendNumber].lockedSharesMapping[msg.sender] = equityTokenBalance;
        uint256 amountToClaimPerHolder = (dividends[address(equityToken)][dividendNumber].amountToClaim / totalSupply) * equityTokenBalance;

        dividends[address(equityToken)][dividendNumber].claimed += amountToClaimPerHolder;

        stablecoin.transfer(msg.sender, amountToClaimPerHolder);
    }

    function withdrawRemainingFunds(address equityTokenAddress, uint256 dividendNumber) public {
        require(dividends[equityTokenAddress][dividendNumber].creator == msg.sender, "DividendVault: only creator can deactivate dividend");

        dividends[equityTokenAddress][dividendNumber].active = false;
        uint256 remainingFunds = dividends[equityTokenAddress][dividendNumber].amountToClaim - dividends[equityTokenAddress][dividendNumber].claimed;

        stablecoin.transfer(msg.sender, remainingFunds);
    }

    function withdrawLockedShares(IERC20 equityToken, uint256 dividendNumber) public {
        require(
            block.number > dividends[address(equityToken)][dividendNumber].endBlock || dividends[address(equityToken)][dividendNumber].active == false,
            "DividendVault: this dividend is still active"
        );
        uint256 lockedShares = dividends[address(equityToken)][dividendNumber].lockedSharesMapping[msg.sender];
        dividends[address(equityToken)][dividendNumber].lockedSharesMapping[msg.sender] = 0;
        equityToken.transfer(msg.sender, lockedShares);
    }
}
