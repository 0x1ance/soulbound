// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "./ISoulhub.sol";
import "./soulhub-manager/ISoulhubManager.sol";
import "./lib/SoulErrorCodes.sol";
import "../utils/SignatureHelper.sol";

/**
 * @dev [Author:0x1ance] Implementation of Soulhub contract mentioned in the {Soulbound - Soulhub Contract}
 *
 * * [Soulhub Contract]
 * * A soulhub contract is an organization-wise user management system to identify & manage the activity of users registered in the organization, it also provides
 * * a verification service for satellite soulbound contracts to verify the identity of accounts based on the corresponding bounded user soul.
 * The identity of each user in the soulhub contract will be represented by a unique user soul, while the user wallet address will be bound to that user soul upon
 * the wallet address registration (either by the soulhub administrator or through an authentication signature). This user soul will be used to identify and manage
 * the activities of that user through blockchain transactions from the corresponding bound wallet address. Considering various business requirements, the structural
 * design of this soulhub contract allows the organization to bind multiple wallet addresses to the same user soul. In general, this contract serves as a general
 * data store for all the user data in the organization.
 */
contract Soulhub is ISoulhub, ERC165, Ownable {
    // ─── Metadata ────────────────────────────────────────────────────────

    string public _name; // The name of the soulhub
    ISoulhubManager private _manager; // Soulhub manager (swappable)

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Constants ───────────────────────────────────────────────────────

    uint256 private constant NULL_SOUL = 0; // Id of the null soul (invalid)

    // ─────────────────────────────────────────────────────────────────────
    // ─── Variables ───────────────────────────────────────────────────────────────

    /**
     * Access Right Management
     */
    mapping(address => uint256) internal _nonces; // Mapping from account to its current consumable nonce

    /**
     *  Soul Management
     */
    mapping(address => uint256) internal _souls; // Mapping from account to its binded soul
    mapping(uint256 => SoulProfile) internal _soulProfiles; // Mapping from soul to the soul profile

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    /**
     * @param soulName_ The name of the deployed soul
     * @param manager_ The address of the initial soulhub manager
     * ! Requirements:
     * ! Input manager_ must pass the validation of interfaceGuard corresponding to the ISoulhubManager interface
     * * Operations:
     * * Initialize the _name metadata
     * * Initialize the _manager metadata
     */
    constructor(
        string memory soulName_,
        address manager_
    ) interfaceGuard(manager_, type(ISoulhubManager).interfaceId) {
        _name = soulName_;
        _manager = ISoulhubManager(manager_);
    }

    // ─────────────────────────────────────────────────────────────────────
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
        require(account_ != address(0), SoulErrorCodes.InvalidAddress);
        require(
            ERC165Checker.supportsInterface(account_, interfaceId_),
            SoulErrorCodes.InvalidInterface
        );
        _;
    }

    /**
     * @dev [Access Right Management] Ensure the nonce has not been consumed yet,
     * @param account_ The target address for validation
     * @param nonce_ the target nonce to validate
     * ! Requirements:
     * ! The nonce_ must be available corresponding to account_
     * * Operations:
     * * Update the nonce_ corresponding to account_ to True after all operations have completed
     */
    modifier nonceGuard(uint256 nonce_, address account_) {
        require(nonce(account_) == nonce_, SoulErrorCodes.InvalidNonce);

        _;

        _nonces[account_] += 1;
    }

    /**
     * @dev [Access Right Management] Ensure the signature is signed by the intended signer
     * @param sig_ The target signature to validate
     * @param signer_ the intended signature signer for validation
     * @param msgHash_ the intended hash of the signature message for validation
     * ! Requirements:
     * ! The signer of sig_ recovered from msgHash_ must equals to signer_
     */
    modifier signatureGuard(
        bytes memory sig_,
        address signer_,
        bytes32 msgHash_
    ) {
        require(
            SignatureHelper.recoverSigner(msgHash_, sig_) == signer_,
            SoulErrorCodes.InvalidSigner
        );
        _;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Public Functions ──────────────────────────────────────────────────────

    /**
     * @dev [Access Right Management] Get the current consumable nonce of an account
     * @param account_ The target account to get the nonce
     * @return {Current Consumable Nonce}
     */
    function nonce(address account_) public view returns (uint256) {
        return _nonces[account_];
    }

    /**
     * @dev [Access Right Management] See {ISoulhub-isAdministrator}: Check if the target account has a soulhub administrator role
     */
    function isAdministrator(address account_) public view returns (bool) {
        return _manager.isAdministrator(account_);
    }

    /**
     * @dev [Soul Management] See {ISoulhub-soul}: Get the assigned soul of an address
     */
    function soul(address account_) public view returns (uint256) {
        return _souls[account_];
    }

    /**
     * @dev [Soul Management] See {ISoulhub-sameSoul}: Check whether two accounts are binded to the same soul
     *
     * Notes:
     * * If targetAccount_ is NULL address, return FALSE
     * * If targetAccount_ has not been binded to any soul , return FALSE
     */
    function sameSoul(
        address targetAccount_,
        address account_
    ) public view returns (bool) {
        return
            (targetAccount_ != address(0)) &&
            (_souls[targetAccount_] != 0) &&
            (_souls[account_] == _souls[account_]);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── External Functions ──────────────────────────────────────────────────────

    /**
     * @dev [Metadata] See {ISoulhub-manager}: Get the soulhub manager address
     */
    function manager() external view returns (address) {
        return address(_manager);
    }

    /**
     * @dev [Metadata] See {ISoulhub-setManager}: Set the soulhub manager
     * ! Requirements:
     * ! The caller must be the owner
     */
    function setManager(
        address manager_
    )
        external
        onlyOwner
        interfaceGuard(manager_, type(ISoulhubManager).interfaceId)
    {
        _manager = ISoulhubManager(manager_);
        emit SetManager(manager_);
    }

    /**
     * @dev [Soul Management] See {ISoulhub-soulMembers}: Get all the bound address of a soul
     */
    function soulMembers(
        uint256 soul_
    ) external view returns (address[] memory) {
        SoulProfile storage soulProfile = _soulProfiles[soul_];

        address[] memory members = new address[](soulProfile.count);

        for (uint256 i = 0; i < soulProfile.count; i++) {
            members[i] = soulProfile.members[i];
        }

        return members;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Set Soul ───────────────────────────────────────────────────────────────

    /**
     * @dev [Soul Management] See {ISoulhub-setSoul}: Bind an address to a soul & update soul profile
     * ! Requirements:
     * ! The caller must be the owner or soulhub administrator
     */
    function setSoul(address account_, uint256 soul_) external {
        require(_msgSender() == owner() || isAdministrator(_msgSender()));
        _setSoulLogic(account_, soul_);
        emit SetSoul(account_, soul_);
    }

    /**
     * @dev [Soul Management] See {ISoulhub-setSoul}: Bind an address to a soul & update soul profile, validate action by verified signature
     * ! Requirements:
     * ! The signature must pass the validation of signatureGuard
     * ! The signer must be either the owner or soulhub administrator
     * -
     */
    function setSoul(
        address account_,
        uint256 soul_,
        uint256 nonce_,
        bytes memory sig_,
        address signer_
    )
        external
        nonceGuard(nonce_, account_)
        signatureGuard(
            sig_,
            signer_,
            SignatureHelper.prefixed(
                keccak256(
                    abi.encodePacked(
                        "setSoul(address,uint256,uint256,bytes,address)",
                        address(this),
                        account_,
                        soul_,
                        nonce_
                    )
                )
            )
        )
    {
        require(
            signer_ == owner() || isAdministrator(signer_),
            SoulErrorCodes.InvalidSigner
        );
        _setSoulLogic(account_, soul_);
        emit SetSoul(account_, soul_, nonce_, signer_);
    }

    /**
     * @dev Core logic of setting a soul to a specific account
     * @param account_ The target account to set the soul
     * @param soul_ The id of target soul where the account will be set to
     * * Operations:
     * * If the intended soul equals to NULL_SOUL, execute unbind soul logic
     * * If the intended soul is an valid id, execute bind soul logic
     */
    function _setSoulLogic(address account_, uint256 soul_) private {
        if (soul_ == NULL_SOUL) {
            _unbindSoulLogic(account_);
        } else {
            _bindSoulLogic(account_, soul_);
        }
    }

    /**
     * @dev Core logic of unbind a soul
     * @param account_ The target account to set the soul
     * ! Requirements:
     * ! The current soul of the target account must not equals to NULL_SOUL (must already bound to a valid soul)
     * * Operations:
     * * Update the corresponding soul profile, remove address from the member mapping & decrement the member count
     * * Set the soul of target account to NULL_SOUL
     */
    function _unbindSoulLogic(address account_) private {
        uint256 currentSoul = _souls[account_];
        require(currentSoul != NULL_SOUL, SoulErrorCodes.Unauthorized);
        SoulProfile storage soulProfile = _soulProfiles[currentSoul];
        uint256 memberIdx;
        for (uint256 i = 0; i < soulProfile.count; i++) {
            if (soulProfile.members[i] == account_) {
                memberIdx = i;
                break;
            }
        }
        // If the target account is not the last member in current soul profile member list,
        // assign the last member to this memberIdx & remove the last member
        if (memberIdx != (soulProfile.count - 1)) {
            soulProfile.members[memberIdx] = soulProfile.members[
                soulProfile.count - 1
            ];
        }
        delete soulProfile.members[soulProfile.count - 1];
        soulProfile.count -= 1;
        _souls[account_] = NULL_SOUL;
    }

    /**
     * @dev Core logic of binding a soul
     * @param account_ The target account to set the soul
     * @param soul_ The id of target soul where the account will be set to
     * ! Requirements:
     * ! The target soul should not equals to either NULL_SOUL or the current soul of the target account binded to
     * * Operations:
     * * If the target account is already binded to another soul, execute the unbind logic
     * * Bind the soul to the target account with id soul_
     * * Update the soul profile of soul_, add the target account to the member list & increment member count
     */
    function _bindSoulLogic(address account_, uint256 soul_) private {
        uint256 currentSoul = _souls[account_];
        require(
            soul_ != NULL_SOUL && soul_ != currentSoul,
            SoulErrorCodes.InvalidSoul
        );
        // if current soul is not a NULL_SOUL, unbind current soul first
        if (currentSoul != NULL_SOUL) {
            _unbindSoulLogic(account_);
        }
        // update binded soul of target address
        _souls[account_] = soul_;
        // update profile of target soul
        SoulProfile storage soulProfile = _soulProfiles[soul_];
        soulProfile.members[soulProfile.count] = account_;
        soulProfile.count += 1;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Inherited Functions ─────────────────────────────────────────────────────

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId_
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId_ == type(ISoulhub).interfaceId ||
            super.supportsInterface(interfaceId_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
