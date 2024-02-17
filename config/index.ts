import PolygonTestnetNetwork from './polygon-testnet.json'

export type NetworkConfig = {
    environment: string
    network: string
    chainId: string
    rpcUrl: string
    entryPoint: string
}

export const loadConfig = (networkName: string): NetworkConfig => {
    if (networkName === PolygonTestnetNetwork.network) {
        return PolygonTestnetNetwork
    }

    return PolygonTestnetNetwork
}
