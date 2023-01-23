import { Chance } from 'chance';

import { contractDeployer } from '../../utils/ContractDeployer';
import { expect, assert } from 'chai'
import { getInterfaceID } from '../../utils/getInterfaceId';
import { IERC165__factory, ISoulbound__factory } from '../../../typechain-types';
import { ethers } from 'hardhat';

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
    const [soulbound, soulhub] = await contractDeployer.Soulbound({ owner })
    const [newSoulhub] = await contractDeployer.Soulhub({ owner })

    return soulbound.connect(notOwner).subscribeSoulhub(newSoulhub.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Ownable: caller is not the owner')
      })
  })

  it('subscribeSoulhub: should throw error input soulhub address does not supports ISoulhub interface', async () => {
    const [owner, falsySoulhub] = await ethers.getSigners()
    const [soulbound] = await contractDeployer.Soulbound({ owner })

    return soulbound.connect(owner).subscribeSoulhub(falsySoulhub.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulbound:InvalidInterface')
      })
  })

  it('subscribeSoulhub: should subscribe to the new soulhub contract', async () => {
    const [owner] = await ethers.getSigners()
    const [soulbound, oldSoulhub] = await contractDeployer.Soulbound({ owner })
    const [newSoulhub] = await contractDeployer.Soulhub({ owner })

    const before = await soulbound.soulhub()
    await soulbound.connect(owner).subscribeSoulhub(newSoulhub.address)
    const after = await soulbound.soulhub()

    expect(before).not.to.equal(after)
    expect(before).to.equal(oldSoulhub.address)
    expect(after).to.equal(newSoulhub.address)
  })
})
