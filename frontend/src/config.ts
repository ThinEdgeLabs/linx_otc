import type { Token } from '@/types'
import { default as devnetTokens } from './devnet-token-list.json'
import { ALPH_TOKEN_ID, type NetworkId, type Number256 } from '@alephium/web3'
import { loadDeployments } from '../../artifacts/ts/deployments'
import { useTokenStore } from './stores/tokens'

export const tradeFee = 0.005
export const lendingFee = 0n
export const feeAddresses = [
  {
    group: 0,
    address: '1CxVEzDfGp4ZS1NhC4dteJUJQHQ6CxmGSLR5pzjoern7h'
  },
  {
    group: 1,
    address: '1dcJ6yupHufwfhGB7uotHLhiyM1pszjzbzEmEQorjyfz'
  },
  {
    group: 2,
    address: '12CLg5ovSzNAeY7uvbzYBNaprSVccS5fHQ7iTufFY2EJz'
  },
  {
    group: 3,
    address: '18FCn9z5sxXKugehPqpbYaZ4s9Uur5V5Fs2Ac71JbkNm5'
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
    const tokenListArray = Array.from(tokenList)
    tokenListArray.push({
      symbol: 'OGALF',
      name: 'OG ALF',
      contractId: 'c0c0af7a481e3e50c50e418bf8ff6923dc4d878ac3744474e8c708a8adccfb00',
      decimals: 0,
      logoUri: 'https://raw.githubusercontent.com/alephium/tokens-meta/master/logos/ALF.png'
    })
    return tokenListArray
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
