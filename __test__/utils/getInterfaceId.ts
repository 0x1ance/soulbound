import { ethers } from 'ethers'

export function getInterfaceID(contractInterface: ethers.utils.Interface) {
    let interfaceID: ethers.BigNumber = ethers.constants.Zero;
    const functions: string[] = Object.keys(contractInterface.functions);
    for (let i = 0; i < functions.length; i++) {
        interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]));
    }

    return interfaceID;
}