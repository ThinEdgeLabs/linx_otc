import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Token } from '@/types'

interface LoanOrder {
  loanToken?: Token
  loanAmount: number
  collateralToken?: Token
  collateralAmount: number
  interest: number
  duration: number
  creationDate: number
  borrowerRating: number
}

export const useLoanOrderStore = defineStore('loanOrder', () => {
  const order = ref<LoanOrder>({
    loanToken: undefined,
    loanAmount: 0.0,
    collateralToken: undefined,
    collateralAmount: 0.0,
    interest: 0.0,
    duration: 0,
    creationDate: Date.now(),
    borrowerRating: 0
  })

  function setLoanToken(token: Token) {
    order.value!.loanToken = token
  }

  function setCollateralToken(token: Token) {
    order.value!.collateralToken = token
  }

  function setLoanAmount(amount: number) {
    order.value!.loanAmount = amount
    order.value!.interest = amount
  }

  function setCollateralAmount(amount: number) {
    order.value!.collateralAmount = amount
  }

  function setInterest(amount: number) {
    order.value!.interest = amount
  }

  function setDuration(amount: number) {
    order.value!.duration = amount
  }

  function setRating(amount: number) {
    order.value!.borrowerRating = amount
  }

  function reset() {
    order.value = {
      loanToken: undefined,
      loanAmount: 0.0,
      collateralToken: undefined,
      collateralAmount: 0.0,
      interest: 0.0,
      duration: 0,
      creationDate: Date.now(),
      borrowerRating: 0
    }
  }

  return {
    order,
    setLoanToken,
    setLoanAmount,
    setCollateralToken,
    setCollateralAmount,
    setDuration,
    setRating,
    setInterest,
    reset
  }
})
