import type { Token } from '@/types'
import { default as devnetTokens } from './devnet-token-list.json'
import { ALPH_TOKEN_ID, type NetworkId, type Number256 } from '@alephium/web3'
import { loadDeployments } from '../../artifacts/ts/deployments'
import { useTokenStore } from './stores/tokens'

export const tradeFee = 0.005
export const lendingFee = 50n
export const feeAddresses = [
  {
    group: 0,
    address: '1B1yNSA9FwLjUQggGzNvdUGUFq6iBvxyuzk5DGFjaWBfx'
  },
  {
    group: 1,
    address: '17siH7XPUdLr5PgituLjmn5eZqLVsuAcDoUB122u7bZZ8'
  },
  {
    group: 2,
    address: '15P5NoWK5rbyDa1EjFYcJx3JfVPZ59oX5yTRnKpXmUJqd'
  },
  {
    group: 3,
    address: '15zZTAK8idRqxT2HC8HRSC3hCDDKvh4oY6jtxKsJBGGzb'
  }
]
export const useGasPayer = false

export const anyToken: Token = {
  name: 'Any token',
  symbol: 'NONE',
  contractId: '',
  decimals: 18,
  logoUri: '/images/tokens/NONE.png'
}

export const undefinedToken = {
  contractId: 'unknown',
  symbol: 'unknown',
  name: 'unknown',
  decimals: 18,
  logoUri: '/images/tokens/nologo.png'
}

export const getTokens = async () => {
  const network = import.meta.env.VITE_NETWORK_ID
  const tokenStore = useTokenStore()
  if (network === 'testnet' || network === 'mainnet') {
    const tokenList = await tokenStore.getTokens(network)
    return Array.from(tokenList)
  } else if (network === 'devnet') {
    const alph = {
      symbol: 'ALPH',
      name: 'Alephium',
      contractId: ALPH_TOKEN_ID,
      decimals: 18,
      logoUri: '/images/tokens/ALPH.png'
    }
    const tokens = Array.from(devnetTokens as Token[])
    tokens.unshift(alph)
    return tokens
  } else {
    return []
  }
}

export function getDefaultNodeUrl(): string {
  const network = import.meta.env.VITE_NETWORK_ID
  return network === 'devnet' ? 'http://127.0.0.1:22973' : import.meta.env.VITE_ALPH_NODE
}

export function getDefaultExplorerUrl(): string {
  const network = import.meta.env.VITE_NETWORK_ID
  return network === 'devnet' ? 'http://localhost:9090' : import.meta.env.VITE_ALPH_EXPLORER_BACKEND
}

export interface MarketplaceConfig {
  network: NetworkId
  groupIndex: number
  marketplaceAdminAddress: string
  marketplaceContractId: string
  marketplaceContractAddress: string
  nftTemplateId: string
  fee: Number256
  defaultNodeUrl: string
  defaultExplorerUrl: string
}

export function getMarketplaceConfig(): MarketplaceConfig {
  const network = import.meta.env.VITE_NETWORK_ID
  const deployerAddress = import.meta.env.VITE_DEPLOYER_ADDRESS
  const lendingEnabled = import.meta.env.VITE_P2P_LENDING_ENABLED === 'true'
  const deployments = lendingEnabled ? loadDeployments(network as NetworkId, deployerAddress) : null
  const marketPlace = deployments?.contracts.LendingMarketplace.contractInstance
  const groupIndex = marketPlace?.groupIndex ?? 0
  const marketplaceAdminAddress = deployments?.deployerAddress ?? ''
  return {
    network,
    groupIndex,
    marketplaceAdminAddress,
    marketplaceContractId: marketPlace?.contractId ?? '',
    marketplaceContractAddress: marketPlace?.address ?? '',
    nftTemplateId: deployments?.contracts.LendingOffer.contractInstance.contractId ?? '',
    fee: lendingFee,
    defaultNodeUrl: getDefaultNodeUrl(),
    defaultExplorerUrl: getDefaultExplorerUrl()
  }
}
