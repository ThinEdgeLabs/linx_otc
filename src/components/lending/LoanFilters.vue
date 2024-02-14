<script setup lang="ts">
import SimpleTokenSelector from '@/components/SimpleTokenSelector.vue'
import DurationSelector from '@/components/DurationSelector.vue'
import { useLoanStore } from '@/stores/loans'
import { ref } from 'vue'
import { tokens, type Token } from '@/config'

const loanStore = useLoanStore()

const tokenList = Array.from(tokens)
const anyToken: Token = {
  name: 'Any token',
  symbol: 'NONE',
  contract: ''
}

tokenList.unshift(anyToken)

const selectedLoanToken = ref<Token>(anyToken)
const selectedCollateralToken = ref<Token>(anyToken)
const selectedDuration = ref<number | undefined>(undefined)

function setSelectedLoanToken(token: Token) {
  selectedLoanToken.value = token
  updateFilteredList()
}

function setSelectedCollateralToken(token: Token) {
  selectedCollateralToken.value = token
  updateFilteredList()
}

function setSelectedDuration(duration: number) {}

function updateFilteredList() {
  const loanToken =
    selectedLoanToken.value.symbol === 'NONE' ? undefined : selectedLoanToken.value.symbol
  const collateralToken =
    selectedCollateralToken.value.symbol === 'NONE'
      ? undefined
      : selectedCollateralToken.value.symbol
  loanStore.filterLoans(loanToken, collateralToken, selectedDuration.value)
}
</script>

<template>
  <div
    class="flex flex-row items-center w-full space-x-[30px] text-[14px] font-bold text-core-lightest"
  >
    <div class="flex flex-col w-full space-y-[10px]">
      <p>Token you want to loan</p>
      <SimpleTokenSelector
        :token-value="selectedLoanToken"
        :set-token="setSelectedLoanToken"
        :token-list="tokenList"
      />
    </div>
    <div class="flex flex-col w-full space-y-[10px]">
      <p>Token you want to offer as collateral</p>
      <SimpleTokenSelector
        :token-value="selectedCollateralToken"
        :set-token="setSelectedCollateralToken"
        :token-list="tokenList"
      />
    </div>
    <div class="flex flex-col w-full space-y-[10px]">
      <p>Loan duration</p>
      <DurationSelector />
    </div>
    <div class="max-w-[50px]">list</div>
    <div class="max-w-[50px]">grid</div>
  </div>
</template>
