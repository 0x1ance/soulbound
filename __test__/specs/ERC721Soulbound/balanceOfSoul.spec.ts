
import { Chance } from 'chance';
import { contractDeployer } from '../../utils/ContractDeployer';
import { expectFnReturnChange } from '../../../ethers-test-helpers';
import { ethers } from 'hardhat';


const chance = new Chance()

describe('UNIT TEST: ERC721Soulbound Contract - balanceOfSoul', () => {
  it(`balanceOfSoul: should update when the balance of soul members changes
`, async () => {
    const [owner, accountA, accountB] = await ethers.getSigners()
    const name = chance.word({ length: 10 })
    const symbol = chance.word({ length: 5 })
    const [soulhub, soulhubManager] = await contractDeployer.Soulhub({ owner, name })
    const [TestERC721Soulbound] = await contractDeployer.TestERC721Soulbound({ owner, soulhub, name, symbol })

    const userSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](accountA.address, userSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](accountB.address, userSoul)

    await expectFnReturnChange(
      TestERC721Soulbound.connect(owner).mint,
      [accountA.address, 0],
      {
        contract: TestERC721Soulbound,
        functionSignature: 'balanceOfSoul',
        params: [userSoul],
        expectedBefore: 0,
        expectedAfter: 1
      },
    )
    await expectFnReturnChange(
      TestERC721Soulbound.connect(owner).mint,
      [accountB.address, 1],
      {
        contract: TestERC721Soulbound,
        functionSignature: 'balanceOfSoul',
        params: [userSoul],
        expectedBefore: 1,
        expectedAfter: 2
      },
    )
  })
})
