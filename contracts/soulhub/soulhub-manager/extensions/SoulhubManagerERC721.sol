// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../SoulhubManagerBase.sol";
import "../lib/SoulhubManagerErrorCodes.sol";

/**
 * @dev [Author:0x1ance] Experimental implementation of the Soulhub Manager contract in the {Soulbound - Soulhub Manager Contract} with a multi-administrator
 * @dev pattern, through a soul validation approach using ERC721 token
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
 * This implementation allows owner to grant soulhub administrator to multiple addresses for administrative purpose through the ownership of an ERC721 token,
 * while the token holder will be automatically granted the soulhub administrator role (inspiration for further development of variants e.g. SoulhubManagerERC20).
 */
contract SoulhubManagerERC721 is SoulhubManagerBase {
    // ─── Events ──────────────────────────────────────────────────────────

    /**
     * @dev Emitted when `owner` set the admin token
     */
    event SetManagerToken(address indexed account);

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Metadata ───────────────────────────────────────────────────────────────

    IERC721 private _managerToken; // the manager token of the soul manager

    // ─────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    /**
     * @param account_ The address of the initial ERC721 manager token
     * ! Requirements:
     * ! Input account_ must pass the validation of interfaceGuard corresponding to the IERC721 interface
     * * Operations:
     * * Initialize the _managerToken metadata
     */
    constructor(
        address account_
    ) SoulhubManagerBase() interfaceGuard(account_, type(IERC721).interfaceId) {
        _managerToken = IERC721(account_);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Modifiers ───────────────────────────────────────────────────────────────

    /**
     * @dev Ensure the address is implemented with correct Interface
     * @param account_ The target account for validation
     * @param interfaceId_ the interfaceId to validate
     * ! Requirements:
     * ! Input account_ must be a valid address
     * ! Input account_ must supports the interface of interfaceId_
     */
    modifier interfaceGuard(address account_, bytes4 interfaceId_) {
        // address must supports the target interface
        require(
            ERC165Checker.supportsInterface(account_, interfaceId_),
            SoulhubManagerErrorCodes.InvalidInterface
        );
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── External Functions ──────────────────────────────────────────────────────

    /**
     * @dev Get the manager token address
     * @return {Manager Token Address}
     */
    function managerToken() external view returns (address) {
        return address(_managerToken);
    }

    /**
     * @dev See {ISoulhubManager-isAdministrator}. Check whether the given account has a soulhub admin role
     * @param account_ The target account to validate whether has a admin role or is the owner.
     * @return {Validation Result}
     *
     * Notes:
     * TRUE if `account` has net balance of the admin ERC721 Token or is the owner, and FALSE
     * otherwise.
     */
    function isAdministrator(address account_) external view returns (bool) {
        return _managerToken.balanceOf(account_) > 0 || account_ == owner();
    }

    /**
     * @dev Set the manager token
     * @param account_ The target address of an ERC721 token
     * ! Requirements:
     * ! The caller must be the owner
     * ! Input account_ must pass the validation of interfaceGuard corresponding to the IERC721 interface
     * * Operations:
     * * Update the admin token to account_
     * * Emit a {SetAdminToken} event.
     */
    function setManagerToken(
        address account_
    ) external onlyOwner interfaceGuard(account_, type(IERC721).interfaceId) {
        _managerToken = IERC721(account_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
