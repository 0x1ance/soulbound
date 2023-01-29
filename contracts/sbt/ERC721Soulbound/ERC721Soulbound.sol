// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../soulbound/Soulbound.sol";
import "../../soulhub-manager/ISoulhubManager.sol";
import "./lib/ERC721SoulboundErrorCodes.sol";
import "./IERC721Soulbound.sol";

/**
 * @dev [Author:0x1ance] Implementation of Soulbound ERC721 Core contract
 *
 * Notes:
 * Each soul will registered to a soulhub, which will validate whether a specific address has been granted a soulhub administrator role of this sole, if an address has
 * a soul verifer role, every signature signed by this address can be trusted by those contracts soulbounded to this soul
 */
abstract contract ERC721Soulbound is ERC721, Soulbound, IERC721Soulbound {
    // ─── Variables ───────────────────────────────────────────────────────────────

    mapping(uint256 => uint256) private _soulBalances; // Mapping soul to token balance

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Constructor ─────────────────────────────────────────────────────────────

    /**
     * @param name_ The name of the ERC721Soulbound token
     * @param symbol_ The symbol of the ERC721Soulbound token
     * @param soulhub_ The address of the initial soulhub contract this contract is subscribed to
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address soulhub_
    ) ERC721(name_, symbol_) Soulbound(soulhub_) {}

    // ─────────────────────────────────────────────────────────────────────────────
    // ─── Internal Functions ──────────────────────────────────────────────────────

    /**
     * @dev Check whether a token is eligible to transfer from address to address
     * @param from_ The account where the token is transfered from
     * @param to_ The account where the token is transfered to
     * @param tokenId_ The token id of the transfer
     * @return {Validation Result}
     *
     * Notes:
     * Developers are allowed to implement their own way of checking based on different business
     * requirements, for a simpliest example is to check whether from_ and to_ share a same soul
     */
    function _checkTokenTransferEligibility(
        address from_,
        address to_,
        uint256 tokenId_
    ) internal view virtual returns (bool);

    // ─────────────────────────────────────────────────────────────────────────────

    // ─── Public Functions ────────────────────────────────────────────────────────

    /**
     * @dev See {IERC721Soulbound-balanceOfSoul} Get the token balance of a soul
     */
    function balanceOfSoul(uint256 soul_)
        public
        view
        virtual
        returns (uint256)
    {
        return _soulBalances[soul_];
    }

    // ─────────────────────────────────────────────────────────────────────
    // ─── Inherited Functions ─────────────────────────────────────────────

    /**
     * @dev See {ERC721-_beforeTokenTransfer}
     */
    function _beforeTokenTransfer(
        address from_,
        address to_,
        uint256 tokenId_,
        uint256 batchSize_
    ) internal virtual override(ERC721) {
        require(
            _checkTokenTransferEligibility(from_, to_, tokenId_),
            ERC721SoulboundErrorCodes.Unauthorized
        );

        if (batchSize_ > 1) {
            if (from_ != address(0)) {
                _soulBalances[_soulOf(from_)] -= batchSize_;
            }
            if (to_ != address(0)) {
                _soulBalances[_soulOf(to_)] += batchSize_;
            }
        }
        super._beforeTokenTransfer(from_, to_, tokenId_, batchSize_);
    }

    /**
     * @dev See {IERC165-supportsInterface}
     */
    function supportsInterface(bytes4 interfaceId_)
        public
        view
        virtual
        override(Soulbound, ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId_ == type(IERC721Soulbound).interfaceId ||
            super.supportsInterface(interfaceId_);
    }

    // ─────────────────────────────────────────────────────────────────────
}
