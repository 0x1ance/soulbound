
import { Chance } from 'chance';
import { contractDeployer } from '../../utils/ContractDeployer';
import { expectFnReturnChange, expectRevert } from '../../../contract-test-helpers';
import { expect } from 'chai'
import { ethers } from 'hardhat';

const chance = new Chance()

describe('UNIT TEST: ERC721Soulbound Contract - _beforeTokenTransfer', () => {
  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
    test _checkTokenTransferEligibility implementation: 
      - if its minting or burning, caller must be owner or soulhub administrator
      - if its transfering, tokenId must not be locked
      - if its transfering, from_ and to_ should share the same soul
    should throw error if the minter is not either owner or soulhub administrator
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
  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
    test implementation: 
      - if its minting or burning, caller must be owner or soulhub administrator
      - if its transfering, tokenId must not be locked
      - if its transfering, from_ and to_ should share the same soul
    should mint a token if the minter is owner
  `, async () => {
    const [owner, account] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await expectFnReturnChange(
      TestERC721Soulbound.connect(owner).mint,
      [account.address, 0],
      {
        contract: TestERC721Soulbound,
        functionSignature: 'balanceOf',
        params: [account.address,],
        expectedBefore: 0,
        expectedAfter: 1
      },
    )
  })
  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
    test implementation: 
      - if its minting or burning, caller must be owner or soulhub administrator
      - if its transfering, tokenId must not be locked
      - if its transfering, from_ and to_ should share the same soul
    should mint a token if the minter is a soulhub administrator
  `, async () => {
    const [owner, admin, account] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub, soulhubManager] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await soulhubManager.connect(owner).setAdministratorStatus(admin.address, true)

    await expectFnReturnChange(
      TestERC721Soulbound.connect(admin).mint,
      [account.address, 0],
      {
        contract: TestERC721Soulbound,
        functionSignature: 'balanceOf',
        params: [account.address,],
        expectedBefore: 0,
        expectedAfter: 1
      },
    )
  })

  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
  test implementation: 
    - if its minting or burning, caller must be owner or soulhub administrator
    - if its transfering, tokenId must not be locked
    - if its transfering, from_ and to_ should share the same soul
  should transfer a token between account under same soul
`, async () => {
    const [owner, sender, receiver] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await soulhub.connect(owner)['setSoul(address,uint256)'](sender.address, 1)
    await soulhub.connect(owner)['setSoul(address,uint256)'](receiver.address, 1)
    await TestERC721Soulbound.connect(owner).mint(sender.address, 0)

    const receiverBalanceBefore = (await TestERC721Soulbound.connect(receiver).balanceOf(receiver.address)).toNumber()
    await expectFnReturnChange(
      TestERC721Soulbound.connect(sender).transferFrom,
      [sender.address, receiver.address, 0],
      {
        contract: TestERC721Soulbound,
        functionSignature: 'balanceOf',
        params: [sender.address,],
        expectedBefore: 1,
        expectedAfter: 0
      },
    )
    const receiverBalanceAfter = (await TestERC721Soulbound.connect(receiver).balanceOf(receiver.address)).toNumber()

    expect(receiverBalanceBefore).to.equal(0)
    expect(receiverBalanceAfter).to.equal(1)
  })

  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
  test implementation: 
    - if its minting or burning, caller must be owner or soulhub administrator
    - if its transfering, tokenId must not be locked
    - if its transfering, from_ and to_ should share the same soul
  should throw error if the tokenId is locked
`, async () => {
    const [owner, sender, receiver] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await soulhub.connect(owner)['setSoul(address,uint256)'](sender.address, 1)
    await soulhub.connect(owner)['setSoul(address,uint256)'](receiver.address, 1)
    await TestERC721Soulbound.connect(owner).mint(sender.address, 0)
    await TestERC721Soulbound.connect(owner).setTokenLockStatus(0, true)

    await expectRevert(
      TestERC721Soulbound.connect(sender).transferFrom(sender.address, receiver.address, 0),
      'ERC721Soulbound:Unauthorized'
    )
  })

  it(`_beforeTokenTransfer: should check _checkTokenTransferEligibility before token transfer
  test implementation: 
    - if its minting or burning, caller must be owner or soulhub administrator
    - if its transfering, tokenId must not be locked
    - if its transfering, from_ and to_ should share the same soul
  should throw error if the from_ and to_ doesnt share the same soul
`, async () => {
    const [owner, sender, receiver] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    await soulhub.connect(owner)['setSoul(address,uint256)'](sender.address, 1)
    await soulhub.connect(owner)['setSoul(address,uint256)'](receiver.address, 2)
    await TestERC721Soulbound.connect(owner).mint(sender.address, 0)

    await expectRevert(
      TestERC721Soulbound.connect(sender).transferFrom(sender.address, receiver.address, 0),
      'ERC721Soulbound:Unauthorized'
    )
  })
})
