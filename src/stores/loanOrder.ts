import { ref } from 'vue'
import { defineStore } from 'pinia'

interface LoanOrder {
  loanToken: string
  loanAmount: number
  collateralToken: string
  collateralAmount: number
  interest: number
  duration: number
  creationDate: number
  borrowerRating: number
}

export const useLoanOrderStore = defineStore('loanOrder', () => {
  const order = ref<LoanOrder | undefined>()

  function setLoanToken(token: string) {
    order.value!.loanToken = token
  }

  function setCollateralToken(token: string) {
    order.value!.collateralToken = token
  }

  function setLoanAmount(amount: number) {
    order.value!.loanAmount = amount
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

  function startNewLoanOrder() {
    order.value = {
      loanToken: '',
      loanAmount: 0.0,
      collateralToken: '',
      collateralAmount: 0.0,
      interest: 0.0,
      duration: 0,
      creationDate: Date.now(),
      borrowerRating: 0
    }
  }

  function resetOrder() {
    order.value = undefined
  }

  return {
    order,
    setLoanToken,
    setLoanAmount,
    setCollateralToken,
    setCollateralAmount,
    startNewLoanOrder,
    setDuration,
    setRating,
    setInterest,
    resetOrder
  }
})
