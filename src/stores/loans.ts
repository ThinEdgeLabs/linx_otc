import { ref } from 'vue'
import { defineStore } from 'pinia'
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
  const filteredLoans = ref<Array<Loan>>([])

  function initLoans() {
    // Init dummy loans
    loans.value = dummyLoans
    filteredLoans.value = dummyLoans
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

  return { filterLoans, filteredLoans }
})
