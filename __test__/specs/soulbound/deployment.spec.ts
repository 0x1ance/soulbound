import { Chance } from 'chance';

import { contractDeployer } from './../../utils/ContractDeployer';
import { generateInterfaceID, expectRevert } from '../../../contract-test-helpers';
import { expect } from 'chai'
import { IERC165__factory, ISoulbound__factory } from '../../../typechain-types';
import { ethers } from 'hardhat';


const chance = new Chance()

xdescribe('UNIT TEST: Soulbound Contract - deployment', () => {
  it('deployment: should support ISoulbound interface', async () => {
    const [soulbound] = await contractDeployer.Soulbound()

    const IERC165Interface = IERC165__factory.createInterface()
    const ISoulboundInterface = ISoulbound__factory.createInterface()
    const ISoulboundInterfaceId = generateInterfaceID([ISoulboundInterface, IERC165Interface])

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


    await expectRevert(
      // @ts-ignore
      contractDeployer.Soulbound({ owner, soulhub: falsySoulhub }),
      'Soulbound:InvalidInterface'
    )
  })

})
