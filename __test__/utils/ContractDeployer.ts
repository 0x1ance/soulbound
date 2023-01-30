import { SoulhubManager } from './../../typechain-types/contracts/soulhub-manager/SoulhubManager';
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import Chance from 'chance'
import { Soulbound, Soulhub, TestERC721Soulbound } from '../../typechain-types';
import { LogLevel } from '@ethersproject/logger'

ethers.utils.Logger.setLogLevel(LogLevel.ERROR);
const chance = new Chance()

type ContractDeploymentBaseConfig = {
    owner?: SignerWithAddress
}

type SoulhubDeploymentConfig = ContractDeploymentBaseConfig & {
    name?: string,
    manager?: SoulhubManager
}

type SoulboundDeploymentConfig = ContractDeploymentBaseConfig & SoulhubDeploymentConfig & {
    soulhub?: Soulhub
}

type TestERC721SoulboundDeploymentConfig = ContractDeploymentBaseConfig & SoulhubDeploymentConfig & {
    soulhub?: Soulhub
    manager?: SoulhubManager
    name?: string,
    symbol?: string,
    uri?: string
}

class ContractDeployer {

    async SoulhubManager(
        { owner }: ContractDeploymentBaseConfig = {}
    ) {
        const [defaultOwner] = await ethers.getSigners()
        const contractFactory = await ethers.getContractFactory('SoulhubManager')
        const targetOwner = owner ?? defaultOwner
        const soulhubManager = await contractFactory.connect(targetOwner).deploy(
        )
        return [soulhubManager, targetOwner] as [
            SoulhubManager,
            SignerWithAddress,
        ]
    }
    async Soulhub(
        { owner, manager, name = chance.string({ length: 8 }) }: SoulhubDeploymentConfig = {}
    ) {
        const [defaultOwner] = await ethers.getSigners()
        const contractFactory = await ethers.getContractFactory('Soulhub', {
        })
        const targetOwner = owner ?? defaultOwner
        const targetSoulhubManager = manager ?? (await this.SoulhubManager({ owner: targetOwner }))[0]
        const soulhub = await contractFactory.connect(targetOwner).deploy(
            name,
            targetSoulhubManager.address
        )
        return [soulhub, targetSoulhubManager, targetOwner] as [
            Soulhub,
            SoulhubManager,
            SignerWithAddress,
        ]
    }
    async Soulbound(
        { owner, manager, name = chance.string({ length: 8 }), soulhub }: SoulboundDeploymentConfig = {}
    ) {
        const [defaultOwner] = await ethers.getSigners()
        const targetOwner = owner ?? defaultOwner
        const targetSoulhubManager = manager ?? (await this.SoulhubManager({ owner: targetOwner }))[0]
        const targetSoulhub = soulhub ?? (await this.Soulhub({ owner: targetOwner, manager: targetSoulhubManager, name }))[0]

        const contractFactory = await ethers.getContractFactory('Soulbound', {
        })
        const soulbound = await contractFactory.connect(targetOwner).deploy(
            targetSoulhub.address
        )

        return [soulbound, targetSoulhub, targetSoulhubManager, targetOwner] as [
            Soulbound,
            Soulhub,
            SoulhubManager,
            SignerWithAddress,
        ]
    }
    async TestERC721Soulbound(
        { owner, manager, name = chance.string({ length: 8 }), symbol = chance.string({ length: 8 }), uri = chance.domain({ length: 8 }), soulhub }: TestERC721SoulboundDeploymentConfig = {}
    ) {
        const [defaultOwner] = await ethers.getSigners()
        const targetOwner = owner ?? defaultOwner
        const targetSoulhubManager = manager ?? (await this.SoulhubManager({ owner: targetOwner }))[0]
        const targetSoulhub = soulhub ?? (await this.Soulhub({ owner: targetOwner, manager: targetSoulhubManager, name }))[0]

        const contractFactory = await ethers.getContractFactory('TestERC721Soulbound', {
        })
        const testERC721Soulbound = await contractFactory.connect(targetOwner).deploy(
            name,
            symbol,
            uri,
            targetSoulhub.address
        )
        return [testERC721Soulbound, targetSoulhub, targetSoulhubManager, targetOwner] as [
            TestERC721Soulbound,
            Soulhub,
            SoulhubManager,
            SignerWithAddress,
        ]
    }
}

export const contractDeployer = new ContractDeployer();