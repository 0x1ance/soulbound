import { assert } from "chai"

export async function expectRevert(promise: Promise<any>, message: string) {
    await promise.then(() => assert.fail()).catch((err: any) => {
        assert.include(err.message, message)
    })
}