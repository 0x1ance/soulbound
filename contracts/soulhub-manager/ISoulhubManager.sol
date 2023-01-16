// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev [Author:0x1ance] Required interface of a SoulhubManager compliant contract.
 */
interface ISoulhubManager is IERC165 {
    // ─── Abstract Functions ──────────────────────────────────────────────

    /**
     * @dev Check whether the given account has a soulhub administrator role
     * @param account_ The target account to validate whether has a administrator role.
     * @return {Validation Result} TRUE if `account` is a soulhub admin, and FALSE otherwise.
     *
     * Notes:
     * Given the soul verification approaches may varies (single admin, multiple admins,
     * ERC721 holders, ERC20 holders etc.) based on different business requirements, this
     * abstract function serves as a general interface for the common soulhub administrator standard.
     */
    function isAdministrator(address account_) external view returns (bool);

    // ─────────────────────────────────────────────────────────────────────
}
