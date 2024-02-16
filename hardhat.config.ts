import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
require('@nomiclabs/hardhat-ethers');

const config: HardhatUserConfig = {
  solidity: "0.8.18",
};

export default config;
