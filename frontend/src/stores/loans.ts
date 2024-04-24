import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Loan } from '@/types'
import { useAccountStore } from '.'
import { getMarketplaceConfig } from '@/config'
import { ContractEvent, addressFromContractId, decodeEvent } from '@alephium/web3'
import { LendingMarketplace } from '../../../artifacts/ts'
import { type LendingMarketplaceTypes } from '../../../artifacts/ts/LendingMarketplace'

export const useLoanStore = defineStore('loans', () => {
  const loans = ref<Array<Loan>>([])
  const _loans = ref<Array<Loan>>([])
  const sortCategory = ref('loanId')
  const sortUpDown = ref('up')
  const isLoading = ref<boolean>(false)
  let events = Array<ContractEvent>()

  const store = useAccountStore()
  const config = getMarketplaceConfig()
  const marketplaceAddress = addressFromContractId(config.marketplaceContractId)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function getSubcontractsAddresses() {
    const page = 1
    const limit = 20
    async function go(page: number, limit: number, subcontracts: string[]) {
      const result = await store.explorerProvider.contracts.getContractsContractAddressSubContracts(
        marketplaceAddress,
        { page, limit }
      )
      if (result.subContracts?.length === 0 || !result.subContracts) {
        return subcontracts
      } else {
        subcontracts = [...subcontracts, ...result.subContracts!]
        if (result.subContracts?.length < limit) {
          return subcontracts
        } else {
          return go(page + 1, limit, subcontracts)
        }
      }
    }
    return go(page, limit, [])
  }

  async function getMarketplaceEvents() {
    const start = 0
    const limit = 20
    async function go(start: number, limit: number, events: any[]) {
      const contractEvents = await store.nodeProvider!.events.getEventsContractContractaddress(marketplaceAddress, {
        start,
        limit
      })
      if (contractEvents.events.length === 0) {
        return events
      } else {
        const decodedEvents = contractEvents.events.map((event) =>
          decodeEvent(LendingMarketplace.contract, LendingMarketplace.at(marketplaceAddress), event, event.eventIndex)
        )
        events = [...events, ...decodedEvents]
        return go(contractEvents.nextStart, limit, events)
      }
    }
    return go(start, limit, [])
  }

  async function fetchLoans() {
    isLoading.value = true
    if (events.length === 0) {
      events = await getMarketplaceEvents()
    }
    const cancelled = events.filter((e) => e.name === 'LoanCancelled').map((e) => e.fields['loanId'] as String)
    const paid = events.filter((e) => e.name === 'LoanPaid').map((e) => e.fields['loanId'] as String)
    const liquidated = events.filter((e) => e.name === 'LoanLiquidated').map((e) => e.fields['loanId'] as String)
    const closed = new Set([...cancelled, ...paid, ...liquidated])

    loans.value = events
      .filter((event) => event.name === 'LoanCreated')
      .filter((event) => !closed.has(event.fields['loanId'] as String))
      .map((event) => {
        return {
          id: event.fields['id'] as bigint,
          contractId: event.fields['loanId'] as string,
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
    _loans.value = loans.value
    isLoading.value = false
  }

  async function getLoanEvents(contractId: string) {
    if (!events.length) {
      events = await getMarketplaceEvents()
    }
    return events.filter((e) => e.fields['loanId'] === contractId)
  }

  function filterLoans(loanToken?: string, collateralToken?: string, durationDays?: number) {
    loans.value = _loans.value
    if (loanToken != undefined) {
      loans.value = loans.value.filter((e) => e.loanToken === loanToken)
    }
    if (collateralToken != undefined) {
      loans.value = loans.value.filter((e) => e.collateralToken === collateralToken)
    }
    if (durationDays != undefined) {
      if (durationDays === 1) {
        loans.value = loans.value.filter((e) => e.duration <= 7)
      } else {
        loans.value = loans.value.filter((e) => e.duration > durationDays)
      }
    }
    if (!loanToken && !collateralToken && !durationDays) {
      loans.value = _loans.value
    }
  }

  function compareBigInt(a: bigint, b: bigint, asc: boolean) {
    if (asc) {
      if (a > b) {
        return 1
      } else if (a < b) {
        return -1
      } else {
        return 0
      }
    } else {
      if (a > b) {
        return -1
      } else if (a < b) {
        return 1
      } else {
        return 0
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
    loans.value.sort((a, b) => {
      // if (sortCategory.value === 'loanId') {
      //   if (sortUpDown.value === 'up') {
      //     return a.loanId - b.loanId
      //   } else {
      //     return b.loanId - a.loanId
      //   }
      // } else
      if (sortCategory.value === 'loanAmount') {
        if (sortUpDown.value === 'up') {
          return compareBigInt(a.loanAmount, b.loanAmount, true)
        } else {
          return compareBigInt(a.loanAmount, b.loanAmount, false)
        }
      } else if (sortCategory.value === 'collateralAmount') {
        if (sortUpDown.value === 'up') {
          return compareBigInt(a.collateralAmount, b.collateralAmount, true)
        } else {
          return compareBigInt(a.collateralAmount, b.collateralAmount, false)
        }
      } else if (sortCategory.value === 'interest') {
        if (sortUpDown.value === 'up') {
          return compareBigInt(a.interest, b.interest, true)
        } else {
          return compareBigInt(a.interest, b.interest, false)
        }
      } else if (sortCategory.value === 'duration') {
        if (sortUpDown.value === 'up') {
          return compareBigInt(a.duration, b.duration, true)
        } else {
          return compareBigInt(a.duration, b.duration, false)
        }
      } else {
        return 0
      }
    })
  }

  fetchLoans()

  return { filterLoans, loans, sortLoans, sortCategory, fetchLoans, isLoading, getLoanEvents }
})
