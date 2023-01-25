// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev [Author:0x1ance] Required interface of a Soulbound contract.
 */
interface ISoulbound is IERC165 {
    // ─── Events ──────────────────────────────────────────────────────────
    /**
     * @dev Emitted when `owner` subscribe the current contract to a soulhub contract
     */
    event SubscribeSoulhub(address soulhub);

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Abstract Functions ──────────────────────────────────────────────────────

    /**
     * @dev Get the address of the soulhub contract that current contract is subscribeed to
     * @return {Address of Bound Soulhub}
     */
    function soulhub() external view returns (address);

    /**
     * @dev Subscribe the current contract to the target soulhub contract
     * @param soulhub The address of the target soulhub contract
     */
    function subscribeSoulhub(address soulhub) external;

    // ─────────────────────────────────────────────────────────────────────
}
