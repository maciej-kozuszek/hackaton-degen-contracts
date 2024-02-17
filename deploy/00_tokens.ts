import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { EquityToken__factory } from 'src/typechain'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    const _equityName = 'EquityToken'

    const equityToken = await deploy(_equityName, {
        from: deployer,

        log: true,
    })

    const deployerProvider = await ethers.getSigner(deployer)

    const equityTokenContract = EquityToken__factory.connect(equityToken.address, deployerProvider)
    const res = await (await equityTokenContract.initialize('Rumblefish', 'RF')).wait()
    console.log('res', equityTokenContract.address)
    // const equityToken2 = await deploy(_equityName, {
    //     from: deployer,
    //     skipIfAlreadyDeployed: false,
    //     log: true,
    // })

    // const lightAccFactory = await deploy('LightAccountFactory', {
    //     from: deployer,
    //     log: true,
    //     args: [config.entryPoint],
    // })

    // const stable = await deploy(_stableName, {
    //     from: deployer,
    //     log: true,
    // })

    // const tok = await deploy(_tokName, {
    //     from: deployer,
    //     log: true,
    // })
}

func.tags = ['tokens']

export default func
