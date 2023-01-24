import { ethers } from "ethers";

export function isBN(object: any) {
    return ethers.BigNumber.isBigNumber(object) || object instanceof ethers.BigNumber
}