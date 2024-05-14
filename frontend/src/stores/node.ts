import { shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { ExplorerProvider, NodeProvider } from '@alephium/web3'
import { node } from '@alephium/web3'
import { getMarketplaceConfig } from '@/config'

export interface TokenData {
  contract: string
  name: string
  symbol: string
  decimals: number
  balance: number
}

export interface Balance {
  balance: number
}

export const useNodeStore = defineStore('nodeProvider', () => {
  const config = getMarketplaceConfig()
  const nodeProvider = shallowRef<NodeProvider>(
    new NodeProvider(config.defaultNodeUrl, import.meta.env.VITE_ALEPHIUM_NODE_API_KEY as string)
  )
  const explorerProvider = shallowRef<ExplorerProvider>(
    new ExplorerProvider(import.meta.env.VITE_ALPH_EXPLORER_BACKEND as string)
  )

  async function getGroupForAddress(address: string): Promise<node.Group> {
    return nodeProvider.value!.addresses.getAddressesAddressGroup(address)
  }

  return { nodeProvider, explorerProvider, getGroupForAddress }
})
