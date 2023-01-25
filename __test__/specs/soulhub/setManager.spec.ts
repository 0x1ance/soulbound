import { contractDeployer } from '../../utils/ContractDeployer';
import { expect } from 'chai'
import { ethers } from 'hardhat';
import { expectRevert, expectEvent, expectFnReturnChange } from '../../../contract-test-helpers';


describe('UNIT TEST: Soulhub Contract - setManager', () => {

  it('setManager: should update the current soulhub manager', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhub, oldSoulhubManager] = await contractDeployer.Soulhub({ owner })
    const [newSoulhubManager] = await contractDeployer.SoulhubManager({ owner })

    await expectFnReturnChange(
      soulhub.connect(owner).setManager,
      [newSoulhubManager.address],
      {
        contract: soulhub,
        functionSignature: 'manager',
        params: [],
        expectedBefore: oldSoulhubManager.address,
        expectedAfter: newSoulhubManager.address
      })
  })

  it('setManager: should emit a SetManager event', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })
    const [newSoulhubManager] = await contractDeployer.SoulhubManager({ owner })

    await expectEvent(
      soulhub.connect(owner).setManager,
      [newSoulhubManager.address],
      {
        contract: soulhub,
        eventSignature: 'SetManager',
        eventArgs: {
          manager: newSoulhubManager.address
        }
      }
    )
  })

  it('setManager: should throw error if the input soulhub manager address does not supports ISoulhubManager interface', async () => {
    const [owner, falsyManager] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    await expectRevert(
      soulhub.connect(owner).setManager(falsyManager.address),
      'Soulhub:InvalidInterface'
    )
  })

})
