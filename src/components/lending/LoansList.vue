<script setup lang="ts">
import LoanFilters from './LoanFilters.vue'
import LoanHeaders from './LoanHeaders.vue'
import LoanListCard from './loancard/LoanListCard.vue'
import { useLoanStore } from '@/stores/loans'

const loanStore = useLoanStore()
</script>

<template>
  <div class="w-full rounded-lg bg-menu p-[30px]">
    <LoanFilters />
    <LoanHeaders />
    <div class="space-y-4" v-for="loan in loanStore.filteredLoans" v-bind:key="loan.loanId">
      <LoanListCard :loan="loan" />
    </div>
  </div>
</template>
