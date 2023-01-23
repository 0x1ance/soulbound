import { contractDeployer } from '../../utils/ContractDeployer';
import { expect, assert } from 'chai'
import { ethers } from 'hardhat';


describe('UNIT TEST: Soulhub Contract - setManager', () => {
  
  it('setManager: should update the current soulhub manager', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhub, oldSoulhubManager] = await contractDeployer.Soulhub({ owner })

    expect(await soulhub.manager()).to.equal(oldSoulhubManager.address)

    const [newSoulhubManager] = await contractDeployer.SoulhubManager({ owner })
    await soulhub.connect(owner).setManager(newSoulhubManager.address)

    expect(oldSoulhubManager.address).not.to.equal(newSoulhubManager.address)
    expect(await soulhub.manager()).to.equal(newSoulhubManager.address)
  })

  it('setManager: should emit a SetManager event', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const eventsBefore = await soulhub.queryFilter(soulhub.filters.SetManager())

    const [newSoulhubManager] = await contractDeployer.SoulhubManager({ owner })
    await soulhub.connect(owner).setManager(newSoulhubManager.address)

    const eventsAfter = await soulhub.queryFilter(soulhub.filters.SetManager())

    expect(eventsAfter.length).to.equal(eventsBefore.length + 1)
    expect(eventsAfter[0].event).to.equal('SetManager')
    expect(eventsAfter[0].args[0]).to.equal(newSoulhubManager.address)

  })

  it('setManager: should throw error if the input soulhub manager address does not supports ISoulhubManager interface', async () => {
    const [owner, falsyManager] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    return soulhub.connect(owner).setManager(falsyManager.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:InvalidInterface')
      })
  })


})
