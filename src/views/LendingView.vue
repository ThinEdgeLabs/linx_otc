<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoanStore } from '@/stores/loans'
import LoansList from '@/components/lending/LoansList.vue'

const loanStore = useLoanStore()

const loans = loanStore.filterLoans()
</script>
<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-row justify-between w-full">
        <p class="text-[32px] font-extrabold text-white">
          P2P Loans ({{ loanStore.filteredLoans.length }})
        </p>
        <CustomButton :title="'Create New Loan'" />
      </div>
      <p>Choose a loan that suits you, filter for collateral type, duration etc.</p>
    </div>
    <LoansList />
  </section>
</template>
