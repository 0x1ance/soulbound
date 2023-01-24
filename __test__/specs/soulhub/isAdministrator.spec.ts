
import { contractDeployer } from '../../utils/ContractDeployer';
import { expectFnReturnChange } from '../../utils/contract-test-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat';

describe('UNIT TEST: Soulhub Contract - isAdministrator', () => {
  it('isAdministrator: should return true if the soulhub manager contract return true', async () => {
    const [owner, soulhubManagerOwner] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner: soulhubManagerOwner })
    const [soulhub] = await contractDeployer.Soulhub({ owner, manager: soulhubManager })

    expect(await soulhubManager.isAdministrator(soulhubManagerOwner.address)).to.be.true
    expect(await soulhub.isAdministrator(soulhubManagerOwner.address)).to.equal(await soulhubManager.isAdministrator(soulhubManagerOwner.address))
  })
  it('isAdministrator: should return true for a address while the soulhub manager contract has set its manager role', async () => {
    const [owner, soulhubManagerOwner, manager] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner: soulhubManagerOwner })
    const [soulhub] = await contractDeployer.Soulhub({ owner, manager: soulhubManager })

    const soulhubReturnBefore = await soulhub.isAdministrator(manager.address)
    const [soulhubManagerReturnBefore, soulhubManagerReturnAfter] = await expectFnReturnChange(
      soulhubManager.connect(soulhubManagerOwner).setAdministratorStatus,
      [manager.address, true],
      {
        contract: soulhubManager,
        functionSignature: 'isAdministrator',
        params: [manager.address],
        expectedBefore: false,
        expectedAfter: true
      }
    )
    const soulhubReturnAfter = await soulhub.isAdministrator(manager.address)

    expect(soulhubReturnBefore).to.equal(soulhubManagerReturnBefore)
    expect(soulhubReturnAfter).to.equal(soulhubManagerReturnAfter)
  })
  it('isAdministrator: should return false for an irrelevant address if the soulhub manager contract return false', async () => {
    const [owner, soulhubManagerOwner, random] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner: soulhubManagerOwner })
    const [soulhub] = await contractDeployer.Soulhub({ owner, manager: soulhubManager })

    expect(await soulhubManager.isAdministrator(random.address)).to.be.false
    expect(await soulhub.isAdministrator(random.address)).to.equal(await soulhubManager.isAdministrator(random.address))
  })
  it('isAdministrator: should return true for soulhub owner even if the soulhub manager contract return false', async () => {
    const [owner, soulhubManagerOwner, random] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner: soulhubManagerOwner })
    const [soulhub] = await contractDeployer.Soulhub({ owner, manager: soulhubManager })

    expect(await soulhubManager.isAdministrator(owner.address)).to.be.false
    expect(await soulhub.isAdministrator(owner.address)).not.to.equal(await soulhubManager.isAdministrator(owner.address))
  })
})
