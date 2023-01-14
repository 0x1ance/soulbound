import { ethers } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'

const toBigNumber = (num: number, hex: number = 18) =>
  ethers.utils.parseUnits(num.toString(), hex)

const fromBigNumber = (bigNum: BigNumber, hex: number = 18) =>
  +ethers.utils.formatUnits(bigNum, hex)

const toEther = (num: number) => ethers.utils.parseEther(num.toString())

const fromEther = (ether: BigNumber) => Number(ethers.utils.formatEther(ether))

export const UnitParser = {
  toBigNumber,
  fromBigNumber,
  toEther,
  fromEther,
}
