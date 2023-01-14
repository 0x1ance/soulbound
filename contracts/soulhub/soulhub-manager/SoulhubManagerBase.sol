// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "./ISoulhubManager.sol";
import "./lib/SoulhubManagerErrorCodes.sol";

/**
 * @dev [Author:0x1ance] Abstract contract for implementation of Soulhub Manager contract mentioned in the {Soulbound - Soulhub Manager Contract}
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
 */
abstract contract SoulhubManagerBase is Ownable, ERC165, ISoulhubManager {
    // ─── Constructor ─────────────────────────────────────────────────────

    constructor() {}

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Inherited Functions ─────────────────────────────────────────────────────

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId_
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId_ == type(ISoulhubManager).interfaceId ||
            super.supportsInterface(interfaceId_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
