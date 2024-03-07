import { ref } from 'vue'
import { defineStore } from 'pinia'
import { dummyLoans } from '@/dummyData'
import type { Loan } from '@/types'
import { useAccountStore } from '.'
import { getMarketplaceConfig } from '../../../shared/config'
import { addressFromContractId, decodeEvent } from '@alephium/web3'
import { LendingMarketplace } from '../../../artifacts/ts'

export const useLoanStore = defineStore('loans', () => {
  const loans = ref<Array<Loan> | undefined>()
  const filteredLoans = ref<Array<Loan>>([])
  const sortCategory = ref('loanId')
  const sortUpDown = ref('up')
  const isLoading = ref<boolean>(false)

  async function initLoans() {
    filteredLoans.value = dummyLoans
  }

  async function fetchLoans() {
    const store = useAccountStore()
    const config = getMarketplaceConfig()
    const marketplaceAddress = addressFromContractId(config.marketplaceContractId)

    async function go(start: number, limit: number, events: any[]) {
      const contractEvents = await store.nodeProvider!.events.getEventsContractContractaddress(marketplaceAddress, {
        start,
        limit
      })
      if (contractEvents.events.length === 0) {
        return events
      } else {
        events = [...events, ...contractEvents.events]
        return go(contractEvents.nextStart, limit, events)
      }
    }

    isLoading.value = true
    const events = await go(0, 20, [])
    loans.value = events
      .map((event) =>
        decodeEvent(LendingMarketplace.contract, LendingMarketplace.at(marketplaceAddress), event, event.eventIndex)
      )
      .filter((event) => event.name === 'OfferCreated')
      .map((event) => {
        return {
          loanId: event.fields['lendingOfferContractId'] as string,
          lender: event.fields['lender'] as string,
          borrower: undefined,
          loanToken: event.fields['lendingTokenId'] as string,
          loanAmount: event.fields['lendingAmount'],
          interest: event.fields['interestRate'] as bigint,
          collateralToken: event.fields['collateralTokenId'] as string,
          collateralAmount: event.fields['collateralAmount'] as bigint,
          created: 0,
          startDate: undefined,
          duration: event.fields['duration'] as bigint
        } as Loan
      })
    isLoading.value = false
  }

  function filterLoans(loanToken?: string, collateralToken?: string, durationDays?: number) {
    initLoans()

    if (loanToken != undefined) {
      filteredLoans.value = filteredLoans.value.filter((e) => e.loanToken === loanToken)
    }

    if (collateralToken != undefined) {
      filteredLoans.value = filteredLoans.value.filter((e) => e.collateralToken === collateralToken)
    }

    if (durationDays != undefined) {
      console.log(durationDays)
      if (durationDays === 1) {
        filteredLoans.value = filteredLoans.value.filter((e) => e.duration <= 7)
      } else {
        filteredLoans.value = filteredLoans.value.filter((e) => e.duration > durationDays)
      }
    }
  }

  function sortLoans(category: string) {
    if (category === sortCategory.value) {
      sortUpDown.value = sortUpDown.value === 'up' ? 'down' : 'up'
    } else {
      sortCategory.value = category
      sortUpDown.value = category === 'interest' ? 'down' : 'up'
    }
    filteredLoans.value.sort((a, b) => {
      if (sortCategory.value === 'loanId') {
        if (sortUpDown.value === 'up') {
          return a.loanId - b.loanId
        } else {
          return b.loanId - a.loanId
        }
      } else if (sortCategory.value === 'loanAmount') {
        if (sortUpDown.value === 'up') {
          return a.loanAmount - b.loanAmount
        } else {
          return b.loanAmount - a.loanAmount
        }
      } else if (sortCategory.value === 'collateralAmount') {
        if (sortUpDown.value === 'up') {
          return a.collateralAmount - b.collateralAmount
        } else {
          return b.collateralAmount - a.collateralAmount
        }
      } else if (sortCategory.value === 'interest') {
        if (sortUpDown.value === 'up') {
          return a.interest / a.loanAmount / a.duration - b.interest / b.loanAmount / b.duration
        } else {
          return b.interest / b.loanAmount / b.duration - a.interest / a.loanAmount / a.duration
        }
      } else {
        if (sortUpDown.value === 'up') {
          return a.duration - b.duration
        } else {
          return b.duration - a.duration
        }
      }
    })
  }

  fetchLoans()

  return { filterLoans, filteredLoans, loans, sortLoans, sortCategory, fetchLoans, isLoading }
})
