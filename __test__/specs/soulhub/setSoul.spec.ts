import { contractDeployer } from '../../utils/ContractDeployer';
import { expect, assert } from 'chai'
import { ethers } from 'hardhat';

const NULL_SOUL = 0

describe('UNIT TEST: Soulhub Contract - setSoul', () => {

  it('setSoul: should throw error if the caller is not soulhub administator', async () => {
    const [owner, random] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    return soulhub.connect(random)['setSoul(address,uint256)'](random.address, 1)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:Unauthorized')
      })
  })

  it('setSoul: should success if call is not owner but has a administrator role in solehub manager contract', async () => {
    const [owner, admin, target] = await ethers.getSigners()
    const [soulhub, soulhubManager] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await soulhubManager.connect(owner).setAdministratorStatus(admin.address, true)

    expect(admin.address).not.to.equal(await soulhub.owner())
    expect(await soulhubManager.isAdministrator(admin.address)).to.be.true

    const before = (await soulhub.soul(target.address)).toNumber()
    await soulhub.connect(admin)['setSoul(address,uint256)'](target.address, targetSoul)
    const after = (await soulhub.soul(target.address)).toNumber()

    expect(after).to.equal(targetSoul)
    expect(before).to.equal(0)
  })

  it('setSoul: should emit a SetSoul event', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    const eventFilter = soulhub.filters['SetSoul(address,uint256)']()
    const eventsBefore = await soulhub.queryFilter(eventFilter)

    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)

    const eventsAfter = await soulhub.queryFilter(eventFilter)

    expect(eventsAfter.length).to.equal(eventsBefore.length + 1)
    expect(eventsAfter[0].eventSignature).to.equal('SetSoul(address,uint256)')
    expect(eventsAfter[0].args[0]).to.equal(target.address)

  })

  it('setSoul(signature): should throw error if the nonce is invalid', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const invalidNonce = (await soulhub
      .nonce(target.address)).toNumber() + 1

    const msgHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        invalidNonce,
      ],
    )

    const authedSig = await owner.signMessage(
      ethers.utils.arrayify(msgHash),
    )

    return soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, invalidNonce, authedSig, owner.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:InvalidNonce')
      })
  })


  it('setSoul(signature): should throw error if the input signer is does not match', async () => {
    const [owner, target, invalidSigner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const msgHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ],
    )

    const authedSig = await owner.signMessage(
      ethers.utils.arrayify(msgHash),
    )

    return soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, authedSig, invalidSigner.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:InvalidSigner')
      })
  })

  it('setSoul(signature): should throw error if the signer is neither owner or soulhub administrator', async () => {
    const [owner, target, invalidSigner] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const msgHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ],
    )

    const authedSig = await invalidSigner.signMessage(
      ethers.utils.arrayify(msgHash),
    )

    return soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, authedSig, invalidSigner.address)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:Unauthorized')
      })
  })


  it('setSoul(signature): should increment the user nonce', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })


    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const msgHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ],
    )

    const authedSig = await owner.signMessage(
      ethers.utils.arrayify(msgHash),
    )


    await soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, authedSig, owner.address)

    const nonceAfter = (await soulhub
      .nonce(target.address)).toNumber()

    expect(nonceAfter).to.equal(nonce + 1)

  })

  it('setSoul(signature): should emit a SetSoul event', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })


    const targetSoul = 1
    const nonce = (await soulhub
      .nonce(target.address)).toNumber()

    const msgHash = ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      [
        'setSoul(uint256,uint256,bytes,address)',
        soulhub.address,
        target.address,
        targetSoul,
        nonce,
      ],
    )

    const authedSig = await owner.signMessage(
      ethers.utils.arrayify(msgHash),
    )


    const eventFilter = soulhub.filters['SetSoul(address,uint256,uint256,address)']()
    const eventsBefore = await soulhub.queryFilter(eventFilter)

    await soulhub.connect(target)['setSoul(uint256,uint256,bytes,address)'](targetSoul, nonce, authedSig, owner.address)

    const eventsAfter = await soulhub.queryFilter(eventFilter)

    expect(eventsAfter.length).to.equal(eventsBefore.length + 1)
    expect(eventsAfter[0].eventSignature).to.equal('SetSoul(address,uint256,uint256,address)')
    expect(eventsAfter[0].args[0]).to.equal(target.address)
    expect(eventsAfter[0].args[1].toNumber()).to.equal(targetSoul)
    expect(eventsAfter[0].args[2].toNumber()).to.equal(nonce)
    expect(eventsAfter[0].args[3]).to.equal(owner.address)
  })
})


describe('UNIT TEST: Soulhub Contract - _bindSoulLogic', () => {

  it('_bindSoulLogic: should throw error if the target soul equals to the current soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)

    return soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:InvalidSoul')
      })
  })

  it('_bindSoulLogic: should bind the input soul to the target address', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    const soulBefore = await soulhub.soul(target.address)
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)
    const soulAfter = await soulhub.soul(target.address)

    expect(soulBefore.toNumber()).to.equal(0)
    expect(soulAfter.toNumber()).to.equal(targetSoul)
  })

  it('_bindSoulLogic: should update the soul profile of the target soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    const profileBefore = await soulhub.soulMembers(targetSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)
    const profileAfter = await soulhub.soulMembers(targetSoul)

    expect(profileBefore.length).to.equal(0)
    expect(profileAfter.length).to.equal(1)
    expect(profileAfter.includes(target.address)).to.be.true
  })

  it('_bindSoulLogic: should unbind the current soul first if the current soul of the target address is not null soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 2
    const currentSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)

    const profileBefore = await soulhub.soulMembers(currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, targetSoul)
    const profileAfter = await soulhub.soulMembers(currentSoul)

    expect(profileBefore.length).to.equal(1)
    expect(profileBefore.includes(target.address)).to.be.true
    expect(profileAfter.length).to.equal(0)
    expect(profileAfter.includes(target.address)).to.be.false
  })
})

describe('UNIT TEST: Soulhub Contract - _unbindSoulLogic', () => {

  it('_unbindSoulLogic: should throw error if the current soul is a null soul', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = (await soulhub.soul(target.address)).toNumber()

    expect(currentSoul).to.equal(NULL_SOUL)
    return soulhub.connect(owner)['setSoul(address,uint256)'](target.address, NULL_SOUL)
      .then(() => assert.fail())
      .catch((err: any) => {
        assert.include(err.message, 'Soulhub:Unauthorized')
      })
  })

  it('_unbindSoulLogic: should unbind the current soul from the target address', async () => {
    const [owner, target] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)

    const soulBefore = await soulhub.soul(target.address)
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, NULL_SOUL)
    const soulAfter = await soulhub.soul(target.address)

    expect(soulBefore.toNumber()).to.equal(currentSoul)
    expect(soulAfter.toNumber()).to.equal(NULL_SOUL)
  })
  it('_unbindSoulLogic: should update the soul profile of the target address', async () => {
    const [owner, target, anotherAddr, anotherAddr2] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const currentSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](anotherAddr.address, currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](anotherAddr2.address, currentSoul)

    const profileBefore = await soulhub.soulMembers(currentSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](target.address, NULL_SOUL)
    const profileAfter = await soulhub.soulMembers(currentSoul)

    expect(profileBefore.length).to.equal(3)
    expect(profileBefore.includes(target.address)).to.be.true
    expect(profileAfter.length).to.equal(2)
    expect(profileAfter.includes(target.address)).to.be.false
  })
})
