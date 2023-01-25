import { Chance } from 'chance';

import { contractDeployer } from '../../utils/ContractDeployer';
import { expect } from 'chai'
import { ethers } from 'hardhat';
import { expectFnReturnChange, expectRevert } from '../../../contract-test-helpers';

const chance = new Chance()

describe('UNIT TEST: Soulbound Contract - soulhub & subscribeSoulhub', () => {

  it('soulhub: should return the address of current subscribed soulhub contract', async () => {
    const [owner] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [soulbound] = await contractDeployer.Soulbound({ owner, soulhub })

    expect(await soulbound.soulhub()).to.equal(soulhub.address)
  })

  it('subscribeSoulhub: should throw error if the caller is not owner', async () => {
    const [owner, notOwner] = await ethers.getSigners()
    const [soulbound] = await contractDeployer.Soulbound({ owner })
    const [newSoulhub] = await contractDeployer.Soulhub({ owner })

    await expectRevert(
      soulbound.connect(notOwner).subscribeSoulhub(newSoulhub.address),
      'Ownable: caller is not the owner'
    )
  })

  it('subscribeSoulhub: should throw error input soulhub address does not supports ISoulhub interface', async () => {
    const [owner, falsySoulhub] = await ethers.getSigners()
    const [soulbound] = await contractDeployer.Soulbound({ owner })

    await expectRevert(
      soulbound.connect(owner).subscribeSoulhub(falsySoulhub.address),
      'Soulbound:InvalidInterface'
    )

  })

  it('subscribeSoulhub: should subscribe to the new soulhub contract', async () => {
    const [owner] = await ethers.getSigners()
    const [soulbound, oldSoulhub] = await contractDeployer.Soulbound({ owner })
    const [newSoulhub] = await contractDeployer.Soulhub({ owner })

    const [before, after] = await expectFnReturnChange(
      soulbound.connect(owner).subscribeSoulhub,
      [newSoulhub.address],
      {
        contract: soulbound,
        functionSignature: 'soulhub',
        params: [],
        expectedBefore: oldSoulhub.address,
        expectedAfter: newSoulhub.address
      }
    )

    expect(before).not.to.equal(after)
  })
})
