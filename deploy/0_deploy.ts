import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    const stable = await deploy('StableCoin', {
        from: deployer,
        log: true,
    })

    const equityToken = await deploy('EquityToken', {
        from: deployer,
        log: true,
    })
}

func.tags = ['deploy']

export default func
