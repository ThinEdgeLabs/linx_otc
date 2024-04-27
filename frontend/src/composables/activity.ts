import { useAccountStore, useLoanStore } from '@/stores'
import { ContractEvent } from '@alephium/web3'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'

export function useActivity() {
  const isLoading = ref<boolean>(true)
  const error = ref<any>(undefined)
  const events = ref<ContractEvent[]>([])

  const { account } = storeToRefs(useAccountStore())
  const loansStore = useLoanStore()

  function isActivityEvent(event: ContractEvent) {
    return (
      event.name === 'LoanCreated' ||
      event.name === 'LoanCancelled' ||
      event.name === 'LoanAccepted' ||
      event.name === 'LoanLiquidated' ||
      event.name === 'LoanPaid'
    )
  }

  watchEffect(() => {
    if (!account.value) {
      events.value = []
      return {
        isLoading,
        error,
        events
      }
    }
    isLoading.value = true
    new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
      loansStore
        .getMarketplaceEvents()
        .then((data) => {
          events.value = data.filter((event) => isActivityEvent(event) && event.fields['by'] === account.value?.address)
        })
        .catch((e) => {
          error.value = e
        })
        .finally(() => {
          isLoading.value = false
        })
    })
  })

  return {
    isLoading,
    error,
    events
  }
}
