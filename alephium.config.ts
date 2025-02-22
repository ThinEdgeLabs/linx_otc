import { Configuration } from '@alephium/cli'
import { Number256 } from '@alephium/web3'

export type Settings = {
  liquidationFee: Number256
  borrowingFee: Number256
  ownerAddress: string
  oracleContractId: string
}

export const loadSettings = (network: 'devnet' | 'testnet' | 'mainnet'): Settings => {
  if (network === 'devnet') {
    return {
      ownerAddress: '1EJCtZP3HZP5rDX5v2o32woqLTxp6GS4GoLQGpzVPQm6E',
      liquidationFee: 300n,
      borrowingFee: 100n,
      oracleContractId: '' // Set this value after deploying the TestOracle contract
    }
  } else if (network === 'testnet' || network === 'mainnet') {
    return {
      ownerAddress: process.env.OWNER_ADDRESS as string,
      borrowingFee: process.env.BORROWING_FEE as Number256,
      liquidationFee: process.env.LIQUIDATION_FEE as Number256,
      oracleContractId: process.env.ORACLE_CONTRACT_ID as string
    }
  } else {
    throw new Error('Invalid network')
  }
}

const configuration: Configuration<Settings> = {
  forceRecompile: true,
  networks: {
    devnet: {
      nodeUrl: 'http://127.0.0.1:22973',
      privateKeys: ['a642942e67258589cd2b1822c631506632db5a12aabcf413604e785300d762a5'],
      settings: loadSettings('devnet')
    },

    testnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys:
        process.env.PRIVATE_KEYS === undefined
          ? ['42eeb5ee9a0921048354067a262ecd9cf4817d3d50a8a6cced1cd6e3e9d487db']
          : process.env.PRIVATE_KEYS.split(','),
      settings: loadSettings('testnet')
    },

    mainnet: {
      nodeUrl: process.env.NODE_URL as string,
      privateKeys: process.env.PRIVATE_KEYS === undefined ? [] : process.env.PRIVATE_KEYS.split(','),
      settings: loadSettings('mainnet')
    }
  }
}

export default configuration
