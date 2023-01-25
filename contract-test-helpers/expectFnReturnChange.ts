import { expect } from "chai";
import { BaseContract, ContractFunction, ethers } from "ethers";
import { isBN } from "./utils";

function functionReturnEquals(actual: any, expected: any) {
    if (isBN(actual) || isBN(expected)) {
        const parsedActual = isBN(actual) ? (actual as ethers.BigNumber).toNumber() : actual
        const parsedExpected = isBN(expected) ? (expected as ethers.BigNumber).toNumber() : expected;

        expect(parsedActual).to.equal(parsedExpected,
            `expect function return equals ${parsedExpected} but got ${parsedActual}`);
    } else {
        expect(actual).to.be.deep.equal(expected,
            `expect function return equals ${expected} but got ${actual}`);
    }
}

type ContractFunctionSignatureType<C extends BaseContract, Union> = Union extends keyof C['functions'] ? Union : never

type ExpectFnReturnChangeConfigParams<C extends BaseContract, T = any> = {
    contract: C
    functionSignature: ContractFunctionSignatureType<C, keyof C>
    params: any[] | undefined
    expectedBefore?: T
    expectedAfter?: T
}

export async function expectFnReturnChange<C extends BaseContract, T = any>(promiseFn: Function,
    promiseFnParams: any[], { contract, functionSignature, params = [], expectedBefore, expectedAfter }: ExpectFnReturnChangeConfigParams<C, T>) {
    const actualBefore = (await (contract[functionSignature] as ContractFunction<T>)(...params)) as T

    await promiseFn(...promiseFnParams)

    const actualAfter = (await ((contract[functionSignature] as ContractFunction<T>)(...params))) as T

    expectedBefore !== undefined && functionReturnEquals(actualBefore, expectedBefore)
    expectedAfter !== undefined && functionReturnEquals(actualAfter, expectedAfter)

    return [actualBefore, actualAfter]
}
