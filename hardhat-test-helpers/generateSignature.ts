import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

type GenerateSignatureParams = {
    signer: SignerWithAddress
    types: readonly string[],
    values: readonly any[]
}

export async function generateSignature({ signer, types, values }: GenerateSignatureParams) {
    const msgHash = ethers.utils.solidityKeccak256(
        types,
        values,
    )
    return signer.signMessage(
        ethers.utils.arrayify(msgHash),
    )
}