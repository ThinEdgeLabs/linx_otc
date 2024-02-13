<script setup lang="ts">
import type { Loan } from '@/stores/loans'
import { ref } from 'vue'
import LoanFilters from './LoanFilters.vue'
import LoanHeaders from './LoanHeaders.vue'
import LoanListCard from './loancard/LoanListCard.vue'

const props = defineProps({
  loans: {
    type: Array<Loan>,
    required: true
  }
})

const filteredLoans = ref(Array.from(props.loans))
</script>

<template>
  <div class="w-full rounded-lg bg-menu p-[30px]">
    <LoanFilters />
    <LoanHeaders />
    <div class="space-y-4" v-for="loan in filteredLoans" v-bind:key="loan.loanId">
      <LoanListCard :loan="loan" />
    </div>
  </div>
</template>
