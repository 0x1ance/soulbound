// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;
pragma experimental ABIEncoderV2;

library SignatureHelper {

  // base functions for signature validation
  function splitSignature(bytes memory sig_)
    public
    pure
    returns (
      uint8,
      bytes32,
      bytes32
    )
  {
    require(sig_.length == 65, 'SignatureHelper:InvalidSignature');

    bytes32 r;
    bytes32 s;
    uint8 v;

    assembly {
      r := mload(add(sig_, 32))
      s := mload(add(sig_, 64))
      v := byte(0, mload(add(sig_, 96)))
    }

    return (v, r, s);
  }

  function prefixed(bytes32 hash_) external pure returns (bytes32) {
    return keccak256(abi.encodePacked('\x19Ethereum Signed Message:\n32', hash_));
  }

  function recoverSigner(bytes32 message_, bytes memory sig_) external pure returns (address) {
    uint8 v;
    bytes32 r;
    bytes32 s;

    (v, r, s) = splitSignature(sig_);
    return ecrecover(message_, v, r, s);
  }
}