import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-ethers'
import '@typechain/hardhat'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import { env } from './environment'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      gas: 2100000,
      gasPrice: 8000000000,
    },
    localhost: {
      allowUnlimitedContractSize: true,
      gas: 2100000,
      gasPrice: 8000000000,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${env.INFURA_API_KEY}`,
      ...(env.ROOT_WALLET_PRIVATE_KEY
        ? { accounts: [env.ROOT_WALLET_PRIVATE_KEY] }
        : {}),
    },
    bsc_testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      ...(env.ROOT_WALLET_PRIVATE_KEY
        ? { accounts: [env.ROOT_WALLET_PRIVATE_KEY] }
        : {}),
      tags: ['dev'],
    },
  },
  paths: {
    sources: './contracts',
    tests: './__test__/specs',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false,
    externalArtifacts: ['externalArtifacts/*.json'],
    dontOverrideCompile: false,
  },
  gasReporter: {
    enabled: true,
  },
}

export default config
