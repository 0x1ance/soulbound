// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../soulhub-manager/ISoulhubManager.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @dev [Author:0x1ance] Required interface of a Soulhub compliant contract.
 */
interface ISoulhub is IERC165 {
    // ─── Events ──────────────────────────────────────────────────────────

    /**
     * @dev Emitted when `owner` update the address of the soulhub manager contract
     */
    event SetManager(address manager);
    /**
     * @dev Emitted when `owner` or 'soulhub administrator' binds an "account" to a soul with `soul`.
     */
    event SetSoul(address indexed account, uint256 indexed soul);
    /**
     * @dev Emitted when an "account" is being binded to a soul with `soul` using an authorized
     * @dev signature signed by either `owner` or 'soulhub administrator',
     */
    event SetSoul(
        address indexed account,
        uint256 indexed soul,
        uint256 nonce,
        address indexed signer
    );

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Data Type ───────────────────────────────────────────────────────────────

    /**
     * @dev Returns the soul manager address
     */
    struct SoulProfile {
        uint256 count;
        mapping(uint256 => address) members;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Abstract Functions ──────────────────────────────────────────────────────

    /**
     * @dev Get the soul manager address
     * @return {Manager address}
     */
    function manager() external view returns (address);

    /**
     * @dev Set the soul manager
     * @param manager The address of the target soul manager
     */
    function setManager(address manager) external;

    /**
     * @dev Check if the target account has a soulhub administrator role
     * @param account The target account to validate
     * @return {Validation Result} TRUE if the address has a soulhub administrator role, and FALSE otherwise.
     *
     * Notes:
     * The account will be validated by the soul manager contract to check whether
     * it has been assigned a soulhub administrator role
     */
    function isAdministrator(address account) external view returns (bool);

    /**
     * @dev Get the assigned soul of an address
     * @param account The target account to get the soul
     * @return {Soul}
     *
     * Notes:
     * The binded soul of the target account, 0 as the invalid NULL soul
     */
    function soul(address account) external view returns (uint256);

    /**
     * @dev Get all the bounded address of a soul
     * @param soul The id of the target soul
     * @return {Bound Addresses}
     */
    function soulMembers(
        uint256 soul
    ) external view returns (address[] memory);

    /**
     * @dev Check whether two accounts are binded to the same soul
     * @param targetAccount The target account to validate
     * @param account The account for comparison
     * @return {Validation Result} TRUE if two accounts are binded to the same soul, and FALSE otherwise.
     *
     * Notes:
     * * If targetAccount_ is NULL address, return FALSE
     * * If targetAccount_ has not been binded to any soul , return FALSE
     */
    function sameSoul(
        address targetAccount,
        address account
    ) external view returns (bool);

    /**
     * @dev Bind an address to a soul & update soul profile, validate action by verified signature
     * @param account The target account to update the soul
     * @param soul The soul that caller want the target address to update to
     *
     * * Notes:
     * * Update the soul profile
     * * Caller must be the soulhub administrator or owner
     */
    function setSoul(address account, uint256 soul) external;

    /**
     * @dev Bind an address to a soul, validate action by verified signature
     */
    function setSoul(
        address account_,
        uint256 soul_,
        uint256 nonce_,
        bytes memory sig_,
        address signer_
    ) external;
    // ─────────────────────────────────────────────────────────────────────
}
