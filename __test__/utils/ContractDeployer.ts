import { SoulhubManager } from './../../typechain-types/contracts/soulhub-manager/SoulhubManager';
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import Chance from 'chance'
import { SignatureHelper, Soulbound, Soulhub } from '../../typechain-types';
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

class ContractDeployer {

    signatureHelper?: SignatureHelper

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
        if (!this.signatureHelper) {
            const signatureHelperContractFactory = await ethers.getContractFactory('SignatureHelper')
            this.signatureHelper = (await signatureHelperContractFactory.deploy()) as SignatureHelper
        }
        const [defaultOwner] = await ethers.getSigners()
        const contractFactory = await ethers.getContractFactory('Soulhub', {
            libraries: {
                SignatureHelper: this.signatureHelper.address
            }
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
}

export const contractDeployer = new ContractDeployer();