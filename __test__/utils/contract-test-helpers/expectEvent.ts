import { expect } from "chai";
import { BaseContract, ethers } from "ethers";
import { TypedEvent, TypedEventFilter } from "../../../typechain-types/common";
import { isBN } from "./utils";

function contains(args: ethers.utils.Result | undefined, key: string, value: any) {
    expect(args && key in args).to.equal(true, `Event argument '${key}' not found`);

    if (value === null) {
        expect(args![key]).to.equal(null,
            `expected event argument '${key}' to be null but got ${args![key]}`);
    } else if (isBN(args![key]) || isBN(value)) {
        const actual = isBN(args![key]) ? (args![key] as ethers.BigNumber).toNumber() : args![key];
        const expected = isBN(value) ? (value as ethers.BigNumber).toNumber() : value;
        expect(actual).to.equal(expected,
            `expected event argument '${key}' to have value ${expected} but got ${actual}`);
    } else {
        expect(args![key]).to.be.deep.equal(value,
            `expected event argument '${key}' to have value ${value} but got ${args![key]}`);
    }
}


type InclusiveBigNumberFieldObjectType<R> = { [F in keyof R]?: R[F] extends ethers.BigNumber ? number | ethers.BigNumber : R[F]; }

type ExpectEventParams<C extends BaseContract, S extends keyof C['filters'] extends string ? keyof C['filters'] : never, A> = {
    contract: C,
    eventSignature: S
    eventArgs: C['filters'][S] extends (...args: Array<any>) => TypedEventFilter<TypedEvent<infer N, infer R>> ? InclusiveBigNumberFieldObjectType<R> : {}
}

export async function expectEvent<C extends BaseContract, S extends keyof C["filters"] extends string ? string & keyof C["filters"] : never, E>(
    promiseFn: Function,
    promiseFnParams: any[], { contract, eventSignature, eventArgs }: ExpectEventParams<C, S, E>) {
    const eventFilter = contract['filters'][eventSignature]()
    const eventsBefore = await contract.queryFilter(eventFilter)

    await promiseFn(...promiseFnParams)

    const eventsAfter = await contract.queryFilter(eventFilter)

    expect(eventsAfter.length > 0).to.equal(true, `No '${eventsAfter}' events found`);
    expect(eventsAfter.length).to.equal(eventsBefore.length + 1)

    const exception: any[] = [];
    const event = eventsAfter.find(function (e) {
        for (const [k, v] of Object.entries(eventArgs as {})) {
            try {
                contains(e.args, k, v);
            } catch (error) {
                exception.push(error);
                return false;
            }
        }
        return true;
    });

    if (event === undefined) {
        throw exception[0];
    }

}
