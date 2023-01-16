// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "../soulhub/ISoulhub.sol";
import "./ISoulbound.sol";

library SoulboundErrorCodes {
    string constant InvalidInterface = "Soulbound:InvalidInterface";
    string constant NotOwnerOrSoulhubAdministrator =
        "Soulbound:CallerIsNotOwnerOrSoulhubAdministrator";
}

/**
 * @dev [Author:0x1ance] Implementation of the Soulbound Standard inspired by Vitalik Buterin's SBT whitepaper at https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4105763, and his blog
 * @dev https://vitalik.ca/general/2022/01/26/soulbound.html
 * * The implementation of Soulbound standard by 0x1ance is composed of three main components:
 * 1. Soulhub contract
 * 2. Soulhub manager contract
 * 3. Soulbound contract
 *
 * * [Soulhub Contract]
 * * A soulhub contract is an organization-wise user management system to identify & manage the activity of users registered in the organization, it also provides
 * * a verification service for satellite soulbound contracts to verify the identity of accounts based on the corresponding bounded user soul.
 * The identity of each user in the soulhub contract will be represented by a unique user soul, while the user wallet address will be bound to that user soul upon
 * the wallet address registration (either by the soulhub administrator or through an authentication signature). This user soul will be used to identify and manage
 * the activities of that user through blockchain transactions from the corresponding bound wallet address. Considering various business requirements, the structural
 * design of this soulhub contract allows the organization to bind multiple wallet addresses to the same user soul. In general, this contract serves as a general
 * data store for all the user data in the organization.
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
 * * [Soulbound Contract]
 * * A soulbound contract is the satellite contract of the organizational soulhub contract(s).
 * In general, there are two core purposes for a contract to subscribe as a soulbound contract and be bound to the core soulhub contract:
 * (1) serves as an organization-controlled contract under the subscribed soulhub contract owned by the organization, to satisfy business requirements. Examples can be
 * found in sbt/ERC721Soulbound: soulhub administrators can sign a message hash, to authorize the user to perform the mint function. Or a more complex business case
 * study as the Moxport contract: the moxport contract has been granted as a soulhub administrator role, therefore it can mint the soulbound ERC721 wish token when
 * users call the mintWish function).
 * (2) leverages a reputable, trustable organizational soulhub contract for user identity verification (e.g. to verify whether an address is an active, real person by
 * checking if that address has a valid soul in a famous soulhub contract, etc.).
 */
contract Soulbound is Ownable, ERC165, ISoulbound {
    // ─── Metadata ────────────────────────────────────────────────────────────────

    ISoulhub private _soulhub; // subscribed soulhub contract

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    /**
     * @param soulhub_ The address of the initial soulhub contract this contract is subscribed to
     * * Operations:
     * * Initialize the _soulhub metadata
     */
    constructor(address soulhub_) {
        _soulhub = ISoulhub(soulhub_);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Modifiers ───────────────────────────────────────────────────────────────

    /**
     * @dev Ensure the caller is either the owner or the soulhub administrator of subscribed soulhub contract
     * ! Requirements:
     * ! The caller must be either owner or soulhub administrator of the subscribed soulhub
     */
    modifier onlyOwnerOrSoulhubAdministrator() {
        require(
            _checkOwnerOrSoulhubAdministrator(_msgSender()),
            SoulboundErrorCodes.NotOwnerOrSoulhubAdministrator
        );
        _;
    }

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
            SoulboundErrorCodes.InvalidInterface
        );
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Internal Functions ──────────────────────────────────────────────────────

    /**
     * @dev Validate if the target account is either owner or the soulhub administrator of subscribed soulhub contract
     * @param account_ The target account to validate
     * @return {Validation Result}
     *
     * Notes:
     * TRUE if the acount is either the owner or has a soulhub administrator role, and FALSE otherwise.
     */
    function _checkOwnerOrSoulhubAdministrator(
        address account_
    ) internal view returns (bool) {
        return owner() == account_ || _checkSoulhubAdministrator(account_);
    }

    /**
     * @dev Validate if the target account the soulhub administrator of subscribed soulhub contract
     * @param account_ The target account to validate
     * @return {Validation Result}
     *
     * Notes:
     * TRUE if the acount has a soulhub administrator role, and FALSE otherwise.
     */
    function _checkSoulhubAdministrator(
        address account_
    ) internal view returns (bool) {
        return _soulhub.isAdministrator(account_);
    }

    /**
     * @dev Get the soul of the target account in the subscribed soulhub contract
     * @param account_ The target account
     * @return {Soul}
     */
    function _soulOf(address account_) internal view returns (uint256) {
        return _soulhub.soul(account_);
    }

    /**
     * @dev Validate if the target account has the same soul as the validation account in the subscribed soulhub contract
     * @param targetAccount_, The target account to be validated
     * @param account_ The account for comparison
     * @return {Validation Result}
     *
     * Notes:
     * TRUE if two accounts are binded to the same soul, and FALSE otherwise.
     */
    function _checkSameSoul(
        address targetAccount_,
        address account_
    ) internal view returns (bool) {
        return _soulhub.sameSoul(targetAccount_, account_);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── external Functions ────────────────────────────────────────────────────────

    /**
     * @dev See {ISoulbound-soulhub}: Get the address of the soulhub contract that current contract is subscribed to
     */
    function soulhub() external view returns (address) {
        return address(_soulhub);
    }

    /**
     * @dev See {ISoulbound-subscribeSoulhub}: Subscribe the current contract to the target soulhub contract
     * ! Requirements:
     * ! The caller must be the owner
     */
    function subscribeSoulhub(
        address soulhub_
    ) external onlyOwner interfaceGuard(soulhub_, type(ISoulhub).interfaceId) {
        _soulhub = ISoulhub(soulhub_);
        emit SubscribeSoulhub(soulhub_);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Inherited Functions ─────────────────────────────────────────────────────

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(
        bytes4 interfaceId_
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId_ == type(ISoulbound).interfaceId ||
            super.supportsInterface(interfaceId_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
