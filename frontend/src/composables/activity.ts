import { getTokens } from '@/config'
import { useAccountStore, useLoanStore } from '@/stores'
import { Loan } from '@/types'
import { ActivityEvent } from '@/types/activityEvent'
import { ContractEvent } from '@alephium/web3'
import { storeToRefs } from 'pinia'
import { ref, watchEffect } from 'vue'

export function useActivity() {
  const isLoading = ref<boolean>(true)
  const error = ref<any>(undefined)
  const events = ref<ActivityEvent[]>([])

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

  function getDetails(event: ContractEvent, loanId: number) {
    switch (event.name) {
      case 'LoanCreated':
        return `Created loan #${loanId}`
      case 'LoanCancelled':
        return `Cancelled loan #${loanId}`
      case 'LoanAccepted':
        return `Accepted loan #${loanId}`
      case 'LoanLiquidated':
        return `Liquidated loan #${loanId}`
      case 'LoanPaid':
        return `Paid loan #${loanId}`
      default:
        return 'Unknown'
    }
  }

  function makeActivityEvent(event: ContractEvent, loan: Loan) {
    const collateralToken = getTokens().find((e) => e.contractId === loan?.collateralToken) ?? {
      logoUri: '/images/tokens/nologo.png'
    }
    const borrowedToken = getTokens().find((e) => e.contractId === loan?.loanToken) ?? {
      logoUri: '/images/tokens/nologo.png'
    }
    return {
      details: getDetails(event, Number(loan?.id) || 0),
      timestamp: Number(event.fields['timestamp'] as bigint),
      txId: event.txId,
      tokens: [borrowedToken, collateralToken]
    } as ActivityEvent
  }

  watchEffect(async () => {
    if (!account.value) {
      events.value = []
      return {
        isLoading,
        error,
        events
      }
    }
    isLoading.value = true
    try {
      const marketplaceEvents = await loansStore.getMarketplaceEvents()
      const loans = new Map((await loansStore.getLoans(marketplaceEvents)).map((loan) => [loan.contractId, loan]))
      events.value = marketplaceEvents
        .filter((event) => isActivityEvent(event) && event.fields['by'] === account.value?.address)
        .map((event) => {
          const loan = loans.get(event.fields['loanId'] as string)
          return makeActivityEvent(event, loan!)
        })
        .sort((a, b) => b.timestamp - a.timestamp)
    } catch (e) {
      error.value = e
    } finally {
      isLoading.value = false
    }
  })

  return {
    isLoading,
    error,
    events
  }
}
