import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, providers } from 'ethers'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { EquityToken, EquityTokenFactory__factory, EquityToken__factory } from 'src/typechain'

export async function getEvent(tx: providers.TransactionResponse, contract: Contract, eventName: string) {
    const receipt = await contract.provider.getTransactionReceipt(tx.hash)
    const eventFragment = contract.interface.getEvent(eventName)
    const topic = contract.interface.getEventTopic(eventFragment)
    const logs = receipt.logs?.filter((log) => log.topics.includes(topic)) ?? ''
    if (logs.length === 0) throw new Error(`Event ${eventName} was not emmited`)

    return contract.interface.parseLog(logs[0])
}

export async function getToken(tx: providers.TransactionResponse, projectTokenFactory: EquityToken | Contract, deployer: SignerWithAddress): Promise<EquityToken> {
    const event = await getEvent(tx, projectTokenFactory, 'EquityTokenCreated')
    const proxyAddress = event.args[0]
    return new EquityToken__factory(deployer).attach(proxyAddress)
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre
    const { deployer } = await getNamedAccounts()
    const { deploy } = deployments

    const _equityFactory = 'EquityTokenFactory'
    const _equityName = 'EquityToken'

    const equity = await deploy(_equityName, {
        from: deployer,
        skipIfAlreadyDeployed: true,
        log: true,
        args: [],
    })

    const equityFactory = await deploy(_equityFactory, {
        from: deployer,
        skipIfAlreadyDeployed: true,
        log: true,
        args: [equity.address],
    })

    const deployerProvider = await ethers.getSigner(deployer)
    const factory = EquityTokenFactory__factory.connect(equityFactory.address, deployerProvider)

    const rfTx = await factory.createToken('Rumblefish', 'RF', deployer)
    await rfTx.wait()
    const rfTokenContract = await getToken(rfTx, factory, deployerProvider)

    const pkoTx = await factory.createToken('PKO Bank Polski', 'PKO', deployer)
    await pkoTx.wait()
    const pkoTokenContract = await getToken(pkoTx, factory, deployerProvider)

    console.log('rfToken', rfTokenContract.address)
    console.log('pkoToken', pkoTokenContract.address)
}

func.tags = ['equity-tokens', 'deploy']

export default func
