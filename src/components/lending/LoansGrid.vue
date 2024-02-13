<script setup lang="ts">
import { useLoanStore } from '@/stores/loans'
import { tokens } from '@/config'
import LoanCard from '@/components/lending/loancard/LoanCard.vue'

const loanStore = useLoanStore()
</script>

<template>
  <div class="w-full grid grid-cols-3 gap-[30px]">
    <div
      v-for="loan in loanStore.filterLoans()"
      v-bind:key="loan"
      class="p-[20px] bg-core-darker rounded-lg space-y-[20px]"
    >
      <LoanCard :loan="loan" />
    </div>
  </div>
</template>
