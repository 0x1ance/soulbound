// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

library OptimizedMath {
  function fullMul(uint256 x_, uint256 y_) public pure returns (uint256 l, uint256 h) {
    uint256 mm = mulmod(x_, y_, type(uint256).max);
    l = x_ * y_;
    h = mm - l;
    if (mm < l) h -= 1;
  }

  function mulDiv(
    uint256 x_,
    uint256 y_,
    uint256 z_
  ) external pure returns (uint256) {
    (uint256 l, uint256 h) = fullMul(x_, y_);
    require(h < z_);
    uint256 mm = mulmod(x_, y_, z_);
    if (mm > l) h -= 1;
    l -= mm;
    uint256 pow2 = z_ & (type(uint256).max - z_ + 1);
    z_ /= pow2;
    l /= pow2;
    l += h * ((type(uint256).max - pow2 + 1) / pow2 + 1);
    uint256 r = 1;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    r *= 2 - z_ * r;
    return l * r;
  }
}
