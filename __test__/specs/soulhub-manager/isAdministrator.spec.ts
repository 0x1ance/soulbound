
import { contractDeployer } from '../../utils/ContractDeployer';
import { expect } from 'chai'
import { ethers } from 'hardhat';

describe('UNIT TEST: Soulhub Manager Contract - isAdministrator', () => {
  it('isAdministrator: should return true for the owner address', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner })

    expect(await soulhubManager.isAdministrator(owner.address)).to.be.true
  })

  it('isAdministrator: should return true for a address has set the manager role', async () => {
    const [owner, manager] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner })

    await soulhubManager.connect(owner).setAdministratorStatus(manager.address, true)

    expect(await soulhubManager.isAdministrator(manager.address)).to.be.true
  })

  it('isAdministrator: should return false for an irrelevant address', async () => {
    const [owner, random] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner })

    expect(await soulhubManager.isAdministrator(random.address)).to.be.false
  })
})
