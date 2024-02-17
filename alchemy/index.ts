import { LightSmartContractAccount, getDefaultLightAccountFactoryAddress } from '@alchemy/aa-accounts'
import { AlchemyProvider } from '@alchemy/aa-alchemy'
import { LocalAccountSigner, SmartAccountSigner } from '@alchemy/aa-core'
import { Chain, polygon, polygonMumbai } from 'viem/chains'

const getChain = (networkName: string): Chain => {
    switch (networkName) {
        case 'polygon-testnet':
            return polygonMumbai
        case 'polygon-mainnet':
            return polygon
        default:
            throw new Error('Unsupported network')
    }
}

export const getAlchemyProvider = (networkName: string) => {
    const chain: Chain = getChain(networkName)
    const privateKey = process.env.DEPLOYER as `0x${string}`
    const alchemyApiKey = process.env.ALCHEMY_KEY as string

    const eoaSigner: SmartAccountSigner = LocalAccountSigner.privateKeyToAccountSigner(privateKey)

    const provider = new AlchemyProvider({
        apiKey: alchemyApiKey,
        chain,
    }).connect(
        (rpcClient) =>
            new LightSmartContractAccount({
                rpcClient,
                owner: eoaSigner,
                chain,
                factoryAddress: getDefaultLightAccountFactoryAddress(chain),
            }),
    )

    return provider
}
