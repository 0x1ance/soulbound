// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "../sbt/ERC721Soulbound/ERC721Soulbound.sol";

/**
 * @dev [Author:0x1ance] Example of an ERC721 token adopting ERC721Soulbound standard
 *
 * Notes:
 * This contract serves as a comprehensive example of:
 * (1) Implementing customized _checkTokenTransferEligibility based on the business
 * requirements & operational flows.
 * (2) Demonstating how a soulbound contract can be fully managed by the soulhub
 * administrator by customizing the mint/burn/_beforeTokenTransfer functions of the
 * original ERC721 standard.
 */
contract TestERC721Soulbound is ERC721Soulbound {
    // ─── Events ──────────────────────────────────────────────────────────────────

    event Mint(address indexed to_, uint256 indexed tokenId_);
    event Burn(uint256 indexed tokenId_);
    event SetTransferrable(uint256 indexed tokenId_, bool status);

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Metadata ────────────────────────────────────────────────────────

    string private _uri; // baseURI of the ERC721 metadata

    // ─────────────────────────────────────────────────────────────────────
    // ─── Variables ───────────────────────────────────────────────────────────────

    /**
     *  Token Management
     */
    mapping(uint256 => bool) _locked; // Mapping from tokenId to locked status, if true then locked

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    /**
     * @param name_ The name of the ERC721Soulbound token
     * @param symbol_ The symbol of the ERC721Soulbound token
     * @param uri_ The initial baseURI of the ERC721 contract
     * @param soulhub_ The address of the initial soulhub contract this contract is subscribed to
     * * Operations:
     * * Initialize the _uri metadata
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory uri_,
        address soulhub_
    ) ERC721Soulbound(name_, symbol_, soulhub_) {
        _uri = uri_;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Internal Functions ──────────────────────────────────────────────────────

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * @dev token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * @dev by default, can be overridden in child contracts.
     * @return {BaseURI}
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _uri;
    }

    function _checkTokenTransferEligibility(
        address from_,
        address to_,
        uint256 tokenId_
    ) internal view virtual override returns (bool) {
        // if its minting || burning: must be soul verifier or owner
        if (from_ == address(0) || to_ == address(0)) {
            return _checkOwnerOrSoulhubAdministrator(_msgSender());
        }

        // only allow not locked tokens to be transferred under same soul
        return !_locked[tokenId_] && _checkSameSoul(from_, to_);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── external Functions ────────────────────────────────────────────────

    /**
     * @dev [Metadata] Set the baseURI of the contract
     * @param uri_ The new baseURI
     * ! Requirements:
     * ! The caller must be the owner
     * * Operations:
     * * Update the _uri metadata
     */
    function setBaseURI(string memory uri_) external onlyOwner {
        _uri = uri_;
    }

    /**
     * @dev Mint a token
     * @param to_ The target account where the token will be minted to
     * @param tokenId_ The target tokenId
     * ! Requirements:
     * ! This contract must not be paused.
     * ! The caller must be either the owner or the soulhub administrators
     */
    function mint(address to_, uint256 tokenId_)
        external
        onlyOwnerOrSoulhubAdministrator
        returns (bool)
    {
        _mint(to_, tokenId_);
        emit Mint(to_, tokenId_);
        return true;
    }

    /**
     * @dev Burn a token
     * @param tokenId_ The target tokenId
     * @return {Success Response}
     * ! Requirements:
     * ! This contract must not be paused.
     * ! The caller must be either the owner or the soulhub administrators
     */
    function burn(uint256 tokenId_)
        external
        onlyOwnerOrSoulhubAdministrator
        returns (bool)
    {
        _burn(tokenId_);
        emit Burn(tokenId_);
        return true;
    }

    /**
     * @dev Set the token transferablity
     * @param tokenId_ The target tokenId
     * @param status_ The updated status of the token transferablity
     * @return {Success Response}
     * ! Requirements:
     * ! This contract must not be paused.
     * ! The caller must be either the owner or the soulhub administrators
     */
    function setTokenLockStatus(uint256 tokenId_, bool status_)
        external
        onlyOwnerOrSoulhubAdministrator
        returns (bool)
    {
        _requireMinted(tokenId_);
        _locked[tokenId_] = status_;
        emit SetTransferrable(tokenId_, status_);
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Inherited Functions ─────────────────────────────────────────────────────

    /**
     * @dev See {ERC721Soulbound-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 tokenId_,
        uint256 batchSize_
    ) internal override(ERC721Soulbound) {
        super._beforeTokenTransfer(from_, to_, tokenId_, batchSize_);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId_)
        public
        view
        virtual
        override(ERC721Soulbound)
        returns (bool)
    {
        return super.supportsInterface(interfaceId_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
