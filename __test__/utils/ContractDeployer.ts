import { SoulhubManager } from './../../typechain-types/contracts/soulhub-manager/SoulhubManager';
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

type ContractDeploymentBaseConfig = {
    owner?: SignerWithAddress
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
}

export const contractDeployer = new ContractDeployer();