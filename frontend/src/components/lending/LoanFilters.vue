<script setup lang="ts">
import SimpleTokenSelector from '@/components/SimpleTokenSelector.vue'
import DurationSelector from '@/components/DurationSelector.vue'
import { useLoanStore } from '@/stores/loans'
import { ref } from 'vue'
import { getTokens } from '@/config'
import type { Token } from '@/types/token'

const loanStore = useLoanStore()

const props = defineProps({
  view: {
    type: String,
    required: true
  },
  changeView: {
    type: Function,
    required: true
  }
})

const tokenList = getTokens()
const anyToken: Token = {
  name: 'Any token',
  symbol: 'NONE',
  contractId: '',
  decimals: 18,
  logoUri: '/images/tokens/NONE.png'
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

function setSelectedDuration(duration: number) {
  if (duration === 0) {
    selectedDuration.value = undefined
  } else {
    selectedDuration.value = duration
  }
  updateFilteredList()
}

function updateFilteredList() {
  const loanToken = selectedLoanToken.value.symbol === 'NONE' ? undefined : selectedLoanToken.value.contractId
  const collateralToken =
    selectedCollateralToken.value.symbol === 'NONE' ? undefined : selectedCollateralToken.value.contractId
  loanStore.filterLoans(loanToken, collateralToken, selectedDuration.value)
}
</script>

<template>
  <div
    class="flex flex-col lg:flex-row items-end w-full space-y-[20px] lg:space-y-0 lg:space-x-[30px] text-[14px] font-bold text-core-lightest"
  >
    <div class="flex flex-col w-full space-y-[10px]">
      <p>Token you want to loan</p>
      <SimpleTokenSelector :token-value="selectedLoanToken" :set-token="setSelectedLoanToken" :token-list="tokenList" />
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
      <DurationSelector :duration-value="selectedDuration" :set-duration="setSelectedDuration" />
    </div>

    <div @click="props.changeView('list')" class="hidden lg:flex flex-row items-center bg-divider p-[14px] rounded-lg">
      <font-awesome-icon
        :icon="['fal', 'list']"
        class="text-[20px]"
        :class="props.view === 'list' ? 'text-accent-3' : 'text-core-lightest'"
      />
    </div>

    <div @click="props.changeView('grid')" class="hidden lg:flex flex-row items-center bg-divider p-[14px] rounded-lg">
      <font-awesome-icon
        :icon="['fal', 'grid-2']"
        class="text-[20px]"
        :class="props.view === 'grid' ? 'text-accent-3' : 'text-core-lightest'"
      />
    </div>
  </div>
</template>
