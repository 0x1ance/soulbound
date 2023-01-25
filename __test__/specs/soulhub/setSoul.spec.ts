import { contractDeployer } from '../../utils/ContractDeployer';
import { expect } from 'chai'
import { ethers } from 'hardhat';
import { expectRevert, expectEvent, expectFnReturnChange } from '../../../contract-test-helpers';
import { generateSignature } from '../../utils/hardhat-helpers';
import { NULL_SOUL } from '../../utils/const';

describe('UNIT TEST: Soulhub Contract - setSoul', () => {

  it('setSoul: should throw error if the caller is not soulhub administator', async () => {
    const [owner, random] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    await expectRevert(
      soulhub.connect(random)['setSoul(address,uint256)'](random.address, 1),
      'Soulhub:Unauthorized'
    )
  })

  it('setSoul: should success if call is not owner but has a administrator role in solehub manager contract', async () => {
    const [owner, admin, target] = await ethers.getSigners()
    const [soulhub, soulhubManager] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await soulhubManager.connect(owner).setAdministratorStatus(admin.address, true)

    expect(admin.address).not.to.equal(await soulhub.owner())
    expect(await soulhubManager.isAdministrator(admin.address)).to.be.true
    await expectFnReturnChange(
      soulhub.connect(admin)['setSoul(address,uint256)'],
      [target.address, targetSoul],
      {
        contract: soulhub,
        functionSignature: 'soul',
        params: [target.address],
        expectedBefore: 0,
        expectedAfter: targetSoul
      }
    )
  })

  it('setSoul: should emit a SetSoul event', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await expectEvent(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, targetSoul],
      {
        contract: soulhub,
        eventSignature: 'SetSoul(address,uint256)',
        eventArgs: {
          account: target.address,
          soul: targetSoul
        }
      }
    )
  })

  it('setSoul(signature): should throw error if the nonce is invalid', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const invalidNonce = (await soulhub
      .nonce(target.address)).toNumber() + 1

    const signature = await generateSignature({
      signer: owner,
      types: ['string', 'address', 'address', 'uint256', 'uint256'],
      values: [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        invalidNonce,
      ]
    })

    await expectRevert(
      soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, invalidNonce, signature, owner.address),
      'Soulhub:InvalidNonce'
    )
  })


  it('setSoul(signature): should throw error if the input signer is does not match', async () => {
    const [owner, target, invalidSigner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const signature = await generateSignature({
      signer: owner,
      types: ['string', 'address', 'address', 'uint256', 'uint256'],
      values: [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ]
    })

    await expectRevert(
      soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, signature, invalidSigner.address),
      'Soulhub:InvalidSigner'
    )

  })

  it('setSoul(signature): should throw error if the signer is neither owner or soulhub administrator', async () => {
    const [owner, target, invalidSigner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const signature = await generateSignature({
      signer: invalidSigner,
      types: ['string', 'address', 'address', 'uint256', 'uint256'],
      values: [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ]
    })

    await expectRevert(
      soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, signature, invalidSigner.address),
      'Soulhub:Unauthorized'
    )
  })


  it('setSoul(signature): should increment the user nonce', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = await soulhub
      .nonce(target.address)

    const signature = await generateSignature({
      signer: owner,
      types: ['string', 'address', 'address', 'uint256', 'uint256'],
      values: [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ]
    })

    await expectFnReturnChange(
      soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'],
      [targetSoul, nonce, signature, owner.address],
      {
        contract: soulhub,
        functionSignature: 'nonce',
        params: [target.address],
        expectedBefore: nonce.toNumber(),
        expectedAfter: 1
      }
    )
  })

  it('setSoul(signature): should emit a SetSoul event', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const signature = await generateSignature({
      signer: owner,
      types: ['string', 'address', 'address', 'uint256', 'uint256'],
      values: [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ],
    })

    await expectEvent(
      soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'],
      [targetSoul, nonce, signature, owner.address],
      {
        contract: soulhub,
        eventSignature: 'SetSoul(address,uint256,uint256,address)',
        eventArgs: {
          account: target.address,
          soul: targetSoul,
          nonce,
          signer: owner.address
        }
      }
    )
  })
})

describe('UNIT TEST: Soulhub Contract - _bindSoulLogic', () => {
  it('_bindSoulLogic: should throw error if the target soul equals to the current soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)

    await expectRevert(
      soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul),
      'Soulhub:InvalidSoul'
    )
  })


  it('_bindSoulLogic: should bind the input soul to the target address', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await expectFnReturnChange(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, targetSoul],
      {
        contract: soulhub,
        functionSignature: 'soul',
        params: [target.address],
        expectedBefore: NULL_SOUL,
        expectedAfter: targetSoul
      }
    )
  })

  it('_bindSoulLogic: should update the soul profile of the target soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await expectFnReturnChange(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, targetSoul],
      {
        contract: soulhub,
        functionSignature: 'soulMembers',
        params: [targetSoul],
        expectedBefore: [],
        expectedAfter: [target.address]
      }
    )
  })

  it('_bindSoulLogic: should unbind the current soul first if the current soul of the target address is not null soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 2
    const currentSoul = 1

    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)

    await expectFnReturnChange(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, targetSoul],
      {
        contract: soulhub,
        functionSignature: 'soulMembers',
        params: [currentSoul],
        expectedBefore: [target.address],
        expectedAfter: []
      }
    )
  })
})


describe('UNIT TEST: Soulhub Contract - _unbindSoulLogic', () => {
  it('_unbindSoulLogic: should throw error if the current soul is a null soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = (await soulhub.soul(target.address)).toNumber()

    expect(currentSoul).to.equal(NULL_SOUL)
    await expectRevert(
      soulhub.connect(owner)['setSoul(address,uint256)'](target.address, NULL_SOUL),
      'Soulhub:Unauthorized'
    )
  })

  it('_unbindSoulLogic: should unbind the current soul from the target address', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)

    await expectFnReturnChange(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, NULL_SOUL],
      {
        contract: soulhub,
        functionSignature: 'soul',
        params: [target.address],
        expectedBefore: currentSoul,
        expectedAfter: NULL_SOUL
      }
    )
  })

  it('_unbindSoulLogic: should update the soul profile of the target address', async () => {
    const [owner, target, anotherAddr0, anotherAddr1] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](anotherAddr0.address, currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](anotherAddr1.address, currentSoul)

    await expectFnReturnChange(
      soulhub.connect(owner)['setSoul(address,uint256)'],
      [target.address, NULL_SOUL],
      {
        contract: soulhub,
        functionSignature: 'soulMembers',
        params: [currentSoul],
        expectedBefore: [target.address, anotherAddr0.address, anotherAddr1.address],
        expectedAfter: [anotherAddr1.address, anotherAddr0.address]
      }
    )
  })
})
