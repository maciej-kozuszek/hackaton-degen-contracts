import { loadConfig } from 'config'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    const config = loadConfig(hre.network.name)

    const lightAccFactory = await deploy('LightAccountFactory', {
        from: deployer,
        log: true,
        args: [config.entryPoint],
    })

    const stable = await deploy('StableCoin', {
        from: deployer,
        log: true,
    })

    const equityToken = await deploy('EquityToken', {
        from: deployer,
        log: true,
    })

    const tok = await deploy('TOK', {
        from: deployer,
        log: true,
    })
}

func.tags = ['deploy']

export default func
