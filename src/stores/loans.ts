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
  const sortCategory = ref('loanId')
  const sortUpDown = ref('up')

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

  function sortLoans(category: string) {
    if (category === sortCategory.value) {
      sortUpDown.value = sortUpDown.value === 'up' ? 'down' : 'up'
    } else {
      sortCategory.value = category
      sortUpDown.value = 'up'
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
      } else {
        if (sortUpDown.value === 'up') {
          return a.duration - b.duration
        } else {
          return b.duration - a.duration
        }
      }
    })
  }

  return { filterLoans, filteredLoans, sortLoans, sortCategory }
})
