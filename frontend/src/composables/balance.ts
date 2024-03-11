import { useAccountStore } from '@/stores/account'
import { node } from '@alephium/web3'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'

export function useBalance(address?: string) {
  const isLoading = ref<boolean>(false)
  const error = ref<any>(undefined)
  const balance = ref<node.Balance | undefined>()

  const { account, nodeProvider } = storeToRefs(useAccountStore())

  watchEffect(() => {
    if (!account.value) {
      error.value = 'Account not connected'
      balance.value = undefined
      return {
        isLoading,
        error,
        balance
      }
    }

    isLoading.value = true
    nodeProvider?.value.addresses
      .getAddressesAddressBalance(address ?? account?.value.address)
      .then(async (data) => {
        balance.value = data
      })
      .catch((e) => {
        error.value = e
      })
      .finally(() => {
        isLoading.value = false
      })
  })

  return {
    isLoading,
    error,
    balance
  }
}
