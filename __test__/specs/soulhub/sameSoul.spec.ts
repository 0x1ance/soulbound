import { contractDeployer } from '../../utils/ContractDeployer';
import { expect } from 'chai'
import { ethers } from 'hardhat';

const NULL_SOUL = 0

xdescribe('UNIT TEST: Soulhub Contract - sameSoul', () => {
  it('sameSoul: should return true if two addresses have been bound to the same soul', async () => {
    const [owner, addr0, addr1] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](addr0.address, targetSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](addr1.address, targetSoul)

    expect(await soulhub.sameSoul(addr0.address, addr1.address)).to.be.true
  })

  it('sameSoul: should return false if the first input address has null soul', async () => {
    const [owner, addr0, addr1] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1
    await soulhub.connect(owner)['setSoul(address,uint256)'](addr1.address, targetSoul)
    const firstCurrentSoul = (await soulhub.soul(addr0.address)).toNumber()

    expect(firstCurrentSoul).to.equal(NULL_SOUL)
    expect(await soulhub.sameSoul(addr0.address, addr1.address)).to.be.false
  })

  it('sameSoul: should return false if the second input address has null soul', async () => {
    const [owner, addr0, addr1] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const targetSoul = 1

    await soulhub.connect(owner)['setSoul(address,uint256)'](addr0.address, targetSoul)

    const secondCurrentSoul = (await soulhub.soul(addr1.address)).toNumber()

    expect(secondCurrentSoul).to.equal(NULL_SOUL)
    expect(await soulhub.sameSoul(addr0.address, addr1.address)).to.be.false
  })


  it('sameSoul: should return false if the two input address has bound to different soul', async () => {
    const [owner, addr0, addr1] = await ethers.getSigners()
    const [soulhub] = await contractDeployer.Soulhub({ owner })

    const firstSoul = 1
    const secondSoul = 2

    await soulhub.connect(owner)['setSoul(address,uint256)'](addr0.address, firstSoul)
    await soulhub.connect(owner)['setSoul(address,uint256)'](addr1.address, secondSoul)

    expect(await soulhub.sameSoul(addr0.address, addr1.address)).to.be.false
  })
})
