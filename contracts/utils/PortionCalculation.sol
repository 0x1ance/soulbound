// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./OptimizedMath.sol";

library PortionCalculation {
    function calc(
        uint256 target_,
        uint256 numerator_,
        uint256 denominator_
    ) external pure returns (uint256 result, uint256 remain) {
        require(
            numerator_ <= denominator_,
            "PortionCalculation:InvalidNumerator"
        );
        uint256 res = OptimizedMath.mulDiv(target_, numerator_, denominator_);
        return (res, target_ - res);
    }
}
