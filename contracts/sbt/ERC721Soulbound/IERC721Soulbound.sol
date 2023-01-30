// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "../../soulbound/ISoulbound.sol";

/**
 * @dev [Author:0x1ance] Required interface of a ERC721Soulbound contract.
 */
interface IERC721Soulbound is ISoulbound {
    /**
     * @dev Get the token balance of a soul
     * @param soul The target soul
     * @return {Token Balance of Soul}
     */
    function balanceOfSoul(uint256 soul) external view returns (uint256);
}
