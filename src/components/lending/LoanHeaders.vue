<script setup lang="ts">
import HorizontalDivider from '../HorizontalDivider.vue'
import { useLoanStore } from '@/stores/loans'

const loanStore = useLoanStore()
</script>

<template>
  <div class="">
    <div class="w-full py-4 px-[20px] flex flex-row text-[14px] font-bold text-core-light">
      <button
        class="group w-full flex flex-row justify-between items-center hover:text-accent-3"
        @click="loanStore.sortLoans('loanId')"
      >
        <div>Offer</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] max-w-[20px] pr-[30px] group-hover:text-accent-3"
          :class="loanStore.sortCategory === 'loanId' ? 'text-accent-3' : 'text-divider '"
        />
      </button>
      <button
        class="group w-full flex flex-row justify-between items-center hover:text-accent-3"
        @click="loanStore.sortLoans('loanAmount')"
      >
        <div>Loan</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] max-w-[20px] pr-[30px] group-hover:text-accent-3"
          :class="loanStore.sortCategory === 'loanAmount' ? 'text-accent-3' : 'text-divider '"
        />
      </button>
      <button
        class="group w-full flex flex-row justify-between items-center hover:text-accent-3"
        @click="loanStore.sortLoans('collateralAmount')"
      >
        <div>Collateral</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px] group-hover:text-accent-3"
          :class="loanStore.sortCategory === 'collateralAmount' ? 'text-accent-3' : 'text-divider '"
        />
      </button>
      <button
        class="group w-full flex flex-row justify-between items-center hover:text-accent-3"
        @click="loanStore.sortLoans('duration')"
      >
        <div>Duration</div>
        <font-awesome-icon
          :icon="['fas', 'sort']"
          class="text-[18px] text-divider max-w-[20px] pr-[30px] group-hover:text-accent-3"
          :class="loanStore.sortCategory === 'duration' ? 'text-accent-3' : 'text-divider '"
        />
      </button>
      <div class="w-full">Interest</div>
      <div class="w-[20%]"></div>
    </div>
    <HorizontalDivider />
  </div>
</template>
