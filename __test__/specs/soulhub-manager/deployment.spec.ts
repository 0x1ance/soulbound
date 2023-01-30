
import { contractDeployer } from './../../utils/ContractDeployer';
import { expect } from 'chai'
import { IERC165__factory, ISoulhubManager__factory } from '../../../typechain-types';
import { ethers } from 'hardhat';
import { generateInterfaceID } from '../../../contract-test-helpers';

describe('UNIT TEST: Soulhub Manager Contract - deployment', () => {
  it('deployment: should support ISoulhubManager interface', async () => {
    const [soulhubManager] = await contractDeployer.SoulhubManager()

    const IERC165Interface = IERC165__factory.createInterface()
    const ISoulhubManagerInterface = ISoulhubManager__factory.createInterface()
    const ISoulhubManagerInterfaceId = generateInterfaceID([ISoulhubManagerInterface, IERC165Interface])

    expect(await soulhubManager.supportsInterface(ISoulhubManagerInterfaceId._hex)).to.be.true
  })

  it('deployment: should return correct owner address', async () => {
    const [owner] = await ethers.getSigners()
    const [soulhubManager] = await contractDeployer.SoulhubManager({ owner })

    expect(await soulhubManager.owner()).to.equal(owner.address)
  })
})
