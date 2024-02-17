export enum KNOWN_ACCOUNT {
  DEPLOYER = "deployer",
  SIGNER = "signer",
}

export enum CHAIN_NAMES {
  ARBITRUM_MAINNET = "arbitrum-mainnet",
  AVALANCHE = "avalanche",
  GANACHE = "ganache",
  HARDHAT = "hardhat",
  ETHEREUM_MAINNET = "mainnet",
  ETHEREUM_SEPOLIA = "sepolia",
  POLYGON_MAINNET = "polygon-mainnet",
  POLYGON_MUMBAI = "polygon-mumbai",
}

export const CHAIN_IDS = {
  [CHAIN_NAMES.ARBITRUM_MAINNET]: 42161,
  [CHAIN_NAMES.AVALANCHE]: 43114,
  [CHAIN_NAMES.GANACHE]: 1337,
  [CHAIN_NAMES.HARDHAT]: 31337,
  [CHAIN_NAMES.ETHEREUM_MAINNET]: 1,
  [CHAIN_NAMES.POLYGON_MAINNET]: 137,
  [CHAIN_NAMES.POLYGON_MUMBAI]: 80001,
  [CHAIN_NAMES.ETHEREUM_SEPOLIA]: 11155111,
}

export enum KNOWN_NETWORK {
  ETHEREUM_SEPOLIA = CHAIN_NAMES.ETHEREUM_SEPOLIA,
  POLYGON_MUMBAI = CHAIN_NAMES.POLYGON_MUMBAI,
}

export const ENTRY_POINT_ADDRESSES = {
  [CHAIN_NAMES.POLYGON_MUMBAI]: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
}

export const ENTRY_POINT_ALCHEMY_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"

export enum TAGS {
  FULL = "FULL",
  TEST = "TEST",
  ACCOUNT_FACTORY = "ACCOUNT_FACTORY",
  ACCOUNT = "ACCOUNT",
  PAYMASTER = "PAYMASTER",
}
