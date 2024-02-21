import { ref } from 'vue'
import { defineStore } from 'pinia'
import { NodeProvider, hexToString } from '@alephium/web3'
import { useRequesterBalanceStore } from '@/stores/requesterBalance'
import { useReceiverBalanceStore } from '@/stores/receiverBalance'

export interface TokenData {
  contract: string
  name: string
  symbol: string
  decimals: number
  balance: number
}

export const useNodeStore = defineStore('nodeProvider', () => {
  const nodeProvider = ref<NodeProvider | undefined>()

  function init() {
    // Uncomment to run from our node
    nodeProvider.value = new NodeProvider(import.meta.env.VITE_ALPH_NODE, import.meta.env.VITE_NODE_API_KEY)
    // Run from Public Node
    // nodeProvider.value = new NodeProvider(import.meta.env.VITE_ALPH_NODE)
  }

  async function getBalance(address: string, isSender: boolean) {
    const balanceStore = isSender ? useRequesterBalanceStore() : useReceiverBalanceStore()
    const totalBalances: Array<TokenData> = []
    if (nodeProvider.value === undefined) {
      init()
    }
    const balance = await nodeProvider.value!.addresses.getAddressesAddressBalance(address)
    // Add Alph balance
    if (balance.balance.length > 0) {
      totalBalances.push({
        contract: 'ALPH',
        name: 'Alphium',
        symbol: 'ALPH',
        decimals: 18,
        balance: parseInt(balance.balance)
      })
    }
    for (const i in balance.tokenBalances) {
      // Fetch token metadata
      const tokenId = balance.tokenBalances[i].id
      const tokenData = await nodeProvider.value!.fetchFungibleTokenMetaData(tokenId)
      const tokenName = hexToString(tokenData.name)
      const tokenSymbol = hexToString(tokenData.symbol)
      totalBalances.push({
        contract: tokenId,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenData.decimals,
        balance: balance.tokenBalances[i].amount
      })
    }
    balanceStore.setBalance(totalBalances)
  }

  async function getGroupForAddress(address: string) {
    if (nodeProvider.value === undefined) {
      init()
    }
    const group = await nodeProvider.value!.addresses.getAddressesAddressGroup(address)
    return group
  }

  return { nodeProvider, getBalance, getGroupForAddress }
})
