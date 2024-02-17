import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, providers } from 'ethers'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { EquityToken, EquityToken__factory } from 'src/typechain'

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

    const stableCoinName = 'StableCoin'

    await deploy(stableCoinName, {
        from: deployer,
        log: true,
        args: [],
    })
}

func.tags = ['stable-token']

export default func
