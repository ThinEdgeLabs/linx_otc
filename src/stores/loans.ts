import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { TokenData } from './node'
import { dummyLoans } from '@/dummyData'
import type { Token } from '@/config'

export interface Loan {
  loanId: number
  lender: string
  borrower: string | undefined
  loanToken: Token['symbol']
  loanAmount: number
  interest: number
  collateralToken: Token['symbol']
  collateralAmount: number
  created: number
  startDate: number
  duration: number
  minRating: number
}

export const useLoanStore = defineStore('loans', () => {
  const loans = ref<Array<Loan> | undefined>()

  function initLoans() {
    // Init dummy loans
    loans.value = dummyLoans
  }

  function filterLoans(loanToken?: string, collateralToken?: string, durationDays?: number) {
    initLoans()
    const filteredLoans = Array.from(loans.value ?? [])

    if (loanToken != undefined) {
      filteredLoans.filter((e) => e.loanToken === loanToken)
    }

    if (collateralToken != undefined) {
      filteredLoans.filter((e) => e.collateralToken === collateralToken)
    }

    if (durationDays != undefined) {
      filteredLoans.filter((e) => e.duration > durationDays)
    }

    return filteredLoans
  }

  return { filterLoans, initLoans }
})
