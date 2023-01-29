import { Chance } from 'chance';

import { contractDeployer } from './../../utils/ContractDeployer';
import { expect } from 'chai'
import { IERC165__factory, ISoulhub__factory } from '../../../typechain-types';
import { ethers } from 'hardhat';
import { generateInterfaceID, expectRevert } from '../../../contract-test-helpers';

const chance = new Chance()

xdescribe('UNIT TEST: Soulhub Contract - deployment', () => {
  it('deployment: should support ISoulhub interface', async () => {
    const [soulhub] = await contractDeployer.Soulhub()

    const IERC165Interface = IERC165__factory.createInterface()
    const ISoulhubInterface = ISoulhub__factory.createInterface()
    const ISoulhubInterfaceId = generateInterfaceID([ISoulhubInterface, IERC165Interface])

    expect(await soulhub.supportsInterface(ISoulhubInterfaceId._hex)).to.be.true
  })
  it('deployment: should set the correct initial soulhub name & soulhub manager', async () => {
    const [owner] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name, manager: soulhubManager })

    expect(await soulhub._name()).to.equal(name)
    expect(await soulhub.manager()).to.equal(soulhubManager.address)
  })
  it('deployment: should throw error if the input soulhub manager address does not supports ISoulhubManager interface', async () => {
    const [owner, falsyManager] = await ethers.getSigners()
    const name = chance.word({ length: 10 })


    await expectRevert(
      // @ts-ignore
      contractDeployer.Soulhub({ owner, name, manager: falsyManager }),
      'Soulhub:InvalidInterface'
    )
  })

})
