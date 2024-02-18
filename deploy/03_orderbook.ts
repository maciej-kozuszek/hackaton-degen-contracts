import { loadConfig } from 'config'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { Orderbook__factory } from 'src/typechain'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments
    const config = loadConfig(hre.network.name)

    const stableCoinName = 'StableCoin'

    const stableCoin = await deploy(stableCoinName, {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
        args: [],
    })

    const orderbook = await deploy('Orderbook', {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
        args: [],
    })

    if (orderbook.newlyDeployed) {
        Orderbook__factory.connect(orderbook.address, await hre.ethers.getSigner(deployer)).initialize(stableCoin.address)
    }
}

func.tags = ['orderbook', 'deploy']

export default func
