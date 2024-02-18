import { BatchUserOperationCallData } from '@alchemy/aa-core'
import { getAlchemyProvider } from 'alchemy'
import { JsonRpcProvider } from 'ethers'
import { TOK__factory } from 'typechain'

export type Order = {
    price: bigint
    tokenAddress: string
    tokenAmount: bigint
    owner: string
}

export const getProvider = (rpc: string, chainId: string) => {
    return new JsonRpcProvider(rpc, Number(chainId))
}

export const test = async (tokAddress: string) => {
    const provider = getAlchemyProvider('polygon-testnet')

    const orders: Order[] = [
        {
            price: BigInt(1e18),
            tokenAddress: '0x000',
            tokenAmount: BigInt(1e18),
            owner: '0x000',
        },
        {
            price: BigInt(1e18),
            tokenAddress: '0x000',
            tokenAmount: BigInt(1e18),
            owner: '0x000',
        },
    ]

    const tok = TOK__factory.connect(tokAddress, getProvider('https://polygon-mumbai.alchemyapi.io/v2/your-api-key', '80001'))

    const batchOrders: BatchUserOperationCallData = []

    for (const order of orders) {
        const populated = await tok.populateTransaction.createOrder(order.price, order.tokenAddress, order.tokenAmount, order.owner)

        batchOrders.push({
            data: populated.data as unknown as `0x${string}`,
            target: populated.to as `0x${string}`,
        })
    }

    await provider.sendUserOperation(batchOrders)
}
