export declare enum KNOWN_ACCOUNT {
    DEPLOYER = "deployer",
    SIGNER = "signer"
}
export declare enum CHAIN_NAMES {
    ARBITRUM_MAINNET = "arbitrum-mainnet",
    AVALANCHE = "avalanche",
    GANACHE = "ganache",
    HARDHAT = "hardhat",
    ETHEREUM_MAINNET = "mainnet",
    ETHEREUM_SEPOLIA = "sepolia",
    POLYGON_MAINNET = "polygon-mainnet",
    POLYGON_MUMBAI = "polygon-mumbai"
}
export declare const CHAIN_IDS: {
    "arbitrum-mainnet": number;
    avalanche: number;
    ganache: number;
    hardhat: number;
    mainnet: number;
    "polygon-mainnet": number;
    "polygon-mumbai": number;
    sepolia: number;
};
export declare enum KNOWN_NETWORK {
    ETHEREUM_SEPOLIA = "sepolia",
    POLYGON_MUMBAI = "polygon-mumbai"
}
export declare const ENTRY_POINT_ADDRESSES: {
    "polygon-mumbai": string;
};
export declare const ENTRY_POINT_ALCHEMY_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export declare enum TAGS {
    FULL = "FULL",
    TEST = "TEST",
    ACCOUNT_FACTORY = "ACCOUNT_FACTORY",
    ACCOUNT = "ACCOUNT",
    PAYMASTER = "PAYMASTER"
}
