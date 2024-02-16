// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";

contract Finisher {
    /**
     * @dev For `try-catch` see docs {https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#security_considerations}
     * @param equityToken arg
     * @param tokenOwner arg
     * @param to arg
     * @param amount arg
     * @param deadline arg
     * @param v arg
     * @param r arg
     * @param s arg
     */
    function transferEquityTokenWithPermit(
        address equityToken,
        address tokenOwner,
        address to,
        uint256 amount,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (bool success) {
        try ERC20PermitUpgradeable(equityToken).permit(tokenOwner, address(this), amount, deadline, v, r, s) {
            transferEquityToken(equityToken, tokenOwner, to, amount);
            return (true);
        } catch Error(string memory /*reason*/) {
            // This is executed in case
            // revert was called inside getData
            // and a reason string was provided.
            return (false);
        } catch Panic(uint /*errorCode*/) {
            // This is executed in case of a panic,
            // i.e. a serious error like division by zero
            // or overflow. The error code can be used
            // to determine the kind of error.
            return (false);
        } catch (bytes memory /*lowLevelData*/) {
            // This is executed in case revert() was used.
            return (false);
        }
    }

    function transferEquityToken(address equityToken, address from, address to, uint256 amount) public {
        ERC20Upgradeable(equityToken).transferFrom(from, to, amount);
    }
}
