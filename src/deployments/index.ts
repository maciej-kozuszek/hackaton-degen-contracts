import deployments from "./deployments.json"

export interface Deployments {
    EquityToken: string
    EquityTokenFactory: string
    StableCoin: string
    Paymaster: string
    Orderbook: string
}

export function getDeployments(chainId: 80001) {
    return (deployments as { [key in 80001]: Deployments })[chainId]
}
