import { ethers } from 'ethers'

export function generateInterfaceID(contractInterfaces: ethers.utils.Interface[]) {
    let interfaceID: ethers.BigNumber = ethers.constants.Zero;
    for (const contractInterface of contractInterfaces) {
        const functions: string[] = Object.keys(contractInterface.functions);
        for (let i = 0; i < functions.length; i++) {
            interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]));
        }
    }
    return interfaceID;
}
