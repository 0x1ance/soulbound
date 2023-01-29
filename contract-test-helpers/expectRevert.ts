import { assert } from "chai"

export async function expectRevert(promise: Promise<any>, message: string) {
    await promise.then(() => assert.fail()).catch((err: any) => {
        console.log('err.message: ',err.message)
        assert.include(err.message, message)
    })
}