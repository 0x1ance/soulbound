
import { contractDeployer } from './../../utils/ContractDeployer';

import { expect, assert } from 'chai'
import { ethers } from 'hardhat'
import { UnitParser } from '../../utils/UnitParser'
import Chance from 'chance'
import { SafeMath } from '../../utils/safeMath'
import { BigNumber } from 'ethers'
const chance = new Chance()

describe('UNIT TEST: Soulhub Manager Contract - deployment', () => {
  it('should return correct name when token is deployed', async () => {
    const [soulhubManager] = await contractDeployer.SoulhubManager()

    // expect(tokenName).to.equal('KING')
  })

  // it('should init the reserve attribute based on the initial vesting schedule configs', async () => {
  //   const [_owner, beneficiaryA, beneficiaryB] = await ethers.getSigners()

  //   const configA = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryA.address,
  //   })

  //   const configB = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryB.address,
  //   })

  //   const [token] = await deployKingToken({
  //     vestingScheduleConfigs: [configA, configB],
  //   })
  //   const reservedTokenAmount = UnitParser.fromEther(await token.reserve())
  //   const configuredTotalVestingAmount = SafeMath.add(
  //     SafeMath.add(
  //       UnitParser.fromEther(configA.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configA.vestingAmount as BigNumber),
  //     ),
  //     SafeMath.add(
  //       UnitParser.fromEther(configB.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configB.vestingAmount as BigNumber),
  //     ),
  //   )

  //   expect(reservedTokenAmount).to.equal(configuredTotalVestingAmount)
  // })

  // it('should mint the corret amount of reserve token to the token contract itself', async () => {
  //   const [_owner, beneficiaryA, beneficiaryB] = await ethers.getSigners()

  //   const configA = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryA.address,
  //   })

  //   const configB = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryB.address,
  //   })

  //   const [token] = await deployKingToken({
  //     vestingScheduleConfigs: [configA, configB],
  //   })
  //   const mintedReserveTokenAmount = UnitParser.fromEther(
  //     await token.balanceOf(token.address),
  //   )
  //   const configuredTotalVestingAmount = SafeMath.add(
  //     SafeMath.add(
  //       UnitParser.fromEther(configA.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configA.vestingAmount as BigNumber),
  //     ),
  //     SafeMath.add(
  //       UnitParser.fromEther(configB.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configB.vestingAmount as BigNumber),
  //     ),
  //   )

  //   expect(mintedReserveTokenAmount).to.equal(configuredTotalVestingAmount)
  // })

  // it('should increase the allowance amount of vesting pool by the token contract itself', async () => {
  //   const [_owner, beneficiaryA, beneficiaryB] = await ethers.getSigners()

  //   const configA = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryA.address,
  //   })

  //   const configB = KingVestingPoolFactory.generateVestingScheduleConfig({
  //     beneficiaryAddress: beneficiaryB.address,
  //   })

  //   const [token] = await deployKingToken({
  //     vestingScheduleConfigs: [configA, configB],
  //   })
  //   const vestinPoolAddress = await token.getVestingPoolAddress()
  //   const vestingPoolAllowanceAmount = UnitParser.fromEther(
  //     await token.allowance(token.address, vestinPoolAddress),
  //   )
  //   const configuredTotalVestingAmount = SafeMath.add(
  //     SafeMath.add(
  //       UnitParser.fromEther(configA.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configA.vestingAmount as BigNumber),
  //     ),
  //     SafeMath.add(
  //       UnitParser.fromEther(configB.lockupAmount as BigNumber),
  //       UnitParser.fromEther(configB.vestingAmount as BigNumber),
  //     ),
  //   )

  //   expect(vestingPoolAllowanceAmount).to.equal(configuredTotalVestingAmount)
  // })

  // it('should deploy vesting pool and return corresponding contract address', async () => {
  //   const [token] = await deployKingToken()
  //   const vestingPoolAddress = await token.getVestingPoolAddress()
  //   expect(vestingPoolAddress).to.be.ok
  // })
})
