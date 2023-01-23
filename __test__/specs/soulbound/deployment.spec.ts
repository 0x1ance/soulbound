import { Chance } from 'chance';

import { contractDeployer } from './../../utils/ContractDeployer';
import { expect, assert } from 'chai'
import { getInterfaceID } from '../../utils/getInterfaceId';
import { IERC165__factory, ISoulbound__factory } from '../../../typechain-types';
import { ethers } from 'hardhat';

const chance = new Chance()

describe('UNIT TEST: Soulbound Contract - deployment', () => {
  it('deployment: should support ISoulbound interface', async () => {
    const [soulbound] = await contractDeployer.Soulbound()

    const IERC165Interface = IERC165__factory.createInterface()
    const IERC165InterfaceId = getInterfaceID(IERC165Interface)
    const ISoulboundInterface = ISoulbound__factory.createInterface()
    const ISoulboundInterfaceId = getInterfaceID(ISoulboundInterface).xor(IERC165InterfaceId)

    expect(await soulbound.supportsInterface(ISoulboundInterfaceId._hex)).to.be.true
  })

  it('deployment: should subscribe to the correct initial soulhub contract', async () => {
    const [owner] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [soulbound] = await contractDeployer.Soulbound({ owner, soulhub })

    expect(await soulbound.soulhub()).to.equal(soulhub.address)
  })

  it('deployment: should throw error if the input soulhub address does not supports ISoulhub interface', async () => {
    const [owner, falsySoulhub] = await ethers.getSigners()

    // @ts-ignore
    return contractDeployer.Soulbound({ owner, soulhub: falsySoulhub })
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulbound:InvalidInterface')
      })

  })
})
