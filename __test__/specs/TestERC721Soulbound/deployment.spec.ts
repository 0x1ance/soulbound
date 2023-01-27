import { ERC721Soulbound__factory } from './../../../typechain-types/factories/contracts/sbt/ERC721Soulbound/ERC721Soulbound__factory';
import { Chance } from 'chance';

import { contractDeployer } from '../../utils/ContractDeployer';
import { generateInterfaceID, expectRevert } from '../../../contract-test-helpers';
import { expect } from 'chai'
import { IERC165__factory, IERC721__factory, ISoulbound__factory, } from '../../../typechain-types';
import { ethers } from 'hardhat';


const chance = new Chance()

describe('UNIT TEST: TestERC721Soulbound Contract - deployment', () => {
  it('deployment: should support the IERC164, ISoulbound & IERC721 interface', async () => {
    const [testERC721Soulbound] = await contractDeployer.TestERC721Soulbound()

    const IERC165Interface = IERC165__factory.createInterface()
    const ISoulboundInterface = ISoulbound__factory.createInterface()
    const IERC721Interface = IERC721__factory.createInterface()

    const IERC165InterfaceId = generateInterfaceID([ // ok
      IERC165Interface,
    ])._hex
    const ISoulboundInterfaceId = generateInterfaceID([ // ok
      ISoulboundInterface,
      IERC165Interface
    ])._hex
    const IERC721InterfaceId = generateInterfaceID([ // ok
      IERC721Interface,
      IERC165Interface
    ])._hex

    expect(await testERC721Soulbound.supportsInterface(IERC165InterfaceId)).to.be.true
    expect(await testERC721Soulbound.supportsInterface(ISoulboundInterfaceId)).to.be.true
    expect(await testERC721Soulbound.supportsInterface(IERC721InterfaceId)).to.be.true
  })

  // it('deployment: should subscribe to the correct initial soulhub contract', async () => {
  //   const [owner] = await ethers.getSigners()
  //   const name = chance.word({ length: 10 })
  //   const [soulhub] = await contractDeployer.Soulhub({ owner, name })
  //   const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub })

  //   expect(await TestERC721Soulbound.soulhub()).to.equal(soulhub.address)
  // })

  // it('deployment: should throw error if the input soulhub address does not supports ISoulhub interface', async () => {
  //   const [owner, falsySoulhub] = await ethers.getSigners()


  //   await expectRevert(
  //     // @ts-ignore
  //     contractDeployer.TestERC721Soulbound({ owner, soulhub: falsySoulhub }),
  //     'TestERC721Soulbound:InvalidInterface'
  //   )
  // })

})
