// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./SoulhubManagerBase.sol";

/**
 * @dev [Author:0x1ance] Experimental implementation of the Soulhub Manager contract in the {Soulbound - Soulhub Manager Contract} with a multi-administrator 
 * @dev pattern, through the simpliest, direct soulhub administrator role assignment approach to addresses.
 *
 * * [Soulhub Manager Contract]
 * * A soulhub manager contract provides the administrator role management functionality for a soulhub contract, which defines the organizational structure, by
 * * granting the administrator role to accounts (either contracts or wallet).
 *  In general, there are two main functionalities for soulhub administrators:
 * (1) perform the administrative operations of the soulhub contract, including setting the user`s wallet address to the corresponding soul, or signing an
 * authorization signature to users to set their wallet address to the corresponding soul themselves, etc.
 * (2) manage the user activities of the organization-controlled soulbound contract, which is already subscribed to the soulhub contract. This is highly customizable,
 * based on the business requirements of each soulbound contract, for example signing an authorization signature to users so they can mint an ERC721Soulbound token,
 * or calling certain soulbound contract functions specifically required the caller as the soulhub administrator.
 *
 * The reason behind separating the soulhub manager contract from the soulhub contract is to provide flexibility for soulhub owners and to grant the soulhub
 * administrator role in a way based on the business requirement. Besides directly setting an address as a soulhub administrator, this design supports more
 * interesting implementations, taking soulhub of a DAO as a possible implementation direction, the DAO owner can grant a soulhub administrator role to users by
 * airdropping a soulbound ERC721 token, or even develop a more complex organizational structure based on it. Even when the organization pivots and changes its
 * business requirement, the soulhub account can easily develop and set up a new soul manager contract fulfilling new requirements.
 * 
 * Notes:
 * This implementation allows owner to grant soulhub administrator to multiple addresses for administrative purpose by directly register the
 * administrator role of an account
 */
contract SoulhubManager is SoulhubManagerBase {
    // ─── Events ──────────────────────────────────────────────────────────

    /**
     * @dev Emitted when `owner` update the administrator status of an account
     */
    event SetAdministratorStatus(address indexed account, bool indexed status);

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Variables ───────────────────────────────────────────────────────────────

    mapping(address => bool) private _administrators; // Mapping from account to administrator status

    // ─────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    constructor() SoulhubManagerBase() {}

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── External Functions ──────────────────────────────────────────────────────

    /**
     * @dev See {ISoulhubManager-isAdministrator}. Check whether the given account has a soulhub administrator role
     * @param account_ The target account to validate whether has a administrator role or is the owner.
     * @return {Validation Result}
     *
     * Notes:
     * TRUE if `account` has a soulhub administrator role or is the owner, and FALSE otherwise.
     */
    function isAdministrator(address account_) external view returns (bool) {
        return _administrators[account_] || account_ == owner();
    }

    /**
     * @dev Set the administrator status of an account
     * @param account_ The target address
     * @param status_ The new administrator status of the target address
     * ! Requirements:
     * ! The caller must be the owner
     * * Operations:
     * * Update the administrator status of account_ into status_
     * * Emit a {SetAdministratorStatus} event.
     */
    function setAdministratorStatus(
        address account_,
        bool status_
    ) external onlyOwner {
        _administrators[account_] = status_;
        emit SetAdministratorStatus(account_, status_);
    }
    // ─────────────────────────────────────────────────────────────────────────────
}
