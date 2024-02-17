import { loadConfig } from 'config'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    const config = loadConfig(hre.network.name)
    const _stableName = 'StableCoin'
    const _equityName = 'EquityToken'
    const _tokName = 'TOK'    
    
    const lightAccFactory = await deploy('LightAccountFactory', {
        from: deployer,
        log: true,
        args: [config.entryPoint],
    })
    
    const stable = await deploy(_stableName, {
        from: deployer,
        log: true,
    })

    const equityToken = await deploy(_equityName, {
        from: deployer,
        log: true,
    })
    
    const tok = await deploy(_tokName, {
        from: deployer,
        log: true,
    })
    
    console.log(`${_stableName} implementation address: ${stable.address}`)
    console.log(`${_equityName} implementation address: ${equityToken.address}`)
    console.log(`${_tokName} implementation address: ${tok.address}`)
}

func.tags = ['deploy']

export default func
