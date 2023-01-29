
import { Chance } from 'chance';
import { contractDeployer } from '../../utils/ContractDeployer';
import { expectRevert } from '../../../contract-test-helpers';
import { expect } from 'chai'
import { ethers } from 'hardhat';


const chance = new Chance()

describe('UNIT TEST: ERC721Soulbound Contract - _checkTokenTransferEligibility', () => {
  it(`_checkTokenTransferEligibility: should be called at _beforeTokenTransfer
    test implementation: if its minting or burning, caller must be owner or soulhub administrator
  `, async () => {
    const [owner, nonOwner] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await expectRevert(
      TestERC721Soulbound.connect(nonOwner).mint(nonOwner.address, 0),
      'Soulbound:NotOwnerOrSoulhubAdministrator'
    )
  })

  // it('deployment: should subscribe to the correct initial soulhub contract', async () => {
  //   const [owner] = await ethers.getSigners()
  //   const name = chance.word({ length: 10 })
  //   const [soulhub] = await contractDeployer.Soulhub({ owner, name })
  //   const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub })

  //   expect(await TestERC721Soulbound.soulhub()).to.equal(soulhub.address)
  // })

  // it('deployment: should set name & symbol metadata', async () => {
  //   const [owner] = await ethers.getSigners()
  //   const name = chance.word({ length: 10 })
  //   const symbol = chance.word({ length: 5 })
  //   const [soulhub] = await contractDeployer.Soulhub({ owner, name })
  //   const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

  //   expect(await TestERC721Soulbound.name()).to.equal(name)
  //   expect(await TestERC721Soulbound.symbol()).to.equal(symbol)
  // })

  // it('deployment: should throw error if the input soulhub address does not supports ISoulhub interface', async () => {
  //   const [owner, falsySoulhub] = await ethers.getSigners()

  //   await expectRevert(
  //     // @ts-ignore
  //     contractDeployer.TestERC721Soulbound({ owner, soulhub: falsySoulhub }),
  //     'Soulbound:InvalidInterface'
  //   )
  // })

})
