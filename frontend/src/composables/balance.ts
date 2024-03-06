import { useAccountStore } from '@/stores/account'
import { useNodeStore } from '@/stores/node'
import type { Token } from '@/types'
import { ALPH_TOKEN_ID, hexToString } from '@alephium/web3'
import { ref } from 'vue'

export interface Balance {
  amount: string
}

export function useBalance() {
  const isLoading = ref<boolean>(true)
  const error = ref<any>(undefined)
  const balance = ref<(Token & Balance)[] | undefined>(undefined)

  const { nodeProvider } = useNodeStore()
  const { account } = useAccountStore()

  if (!account) {
    error.value = 'Account not found'
    return {
      isLoading,
      error,
      balance
    }
  }

  isLoading.value = true
  nodeProvider?.addresses
    .getAddressesAddressBalance(account?.address)
    .then(async (balanceData) => {
      balance.value = []
      balance.value.push({
        contractId: ALPH_TOKEN_ID,
        name: 'Alephium',
        symbol: 'ALPH',
        decimals: 18,
        amount: balanceData.balance
      })
      for (const tokenBalance of balanceData.tokenBalances ?? []) {
        const tokenData = await nodeProvider.fetchFungibleTokenMetaData(tokenBalance.id)
        balance.value.push({
          contractId: tokenBalance.id,
          name: hexToString(tokenData.name),
          symbol: hexToString(tokenData.symbol),
          decimals: tokenData.decimals,
          amount: tokenBalance.amount
        })
      }
      isLoading.value = false
    })
    .catch((e) => {
      error.value = e
    })

  return {
    isLoading,
    error,
    balance
  }
}
