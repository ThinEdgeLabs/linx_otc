<script setup lang="ts">
import LoanFilters from './LoanFilters.vue'
import LoanHeaders from './LoanHeaders.vue'
import LoanGridCard from './loancard/LoanGridCard.vue'
import LoanListCard from './loancard/LoanListCard.vue'
import { useLoanStore } from '@/stores/loans'
import { ref } from 'vue'

const loanStore = useLoanStore()

const view = ref('list')

function changeView(newView: string) {
  view.value = newView
}
</script>

<template>
  <div class="w-full rounded-lg bg-menu p-[30px]">
    <LoanFilters :view="view" :change-view="changeView" />
    <LoanHeaders v-if="view === 'list'" />
    <div v-if="view === 'list'">
      <div class="space-y-4" v-for="loan in loanStore.filteredLoans" v-bind:key="loan.loanId">
        <LoanListCard :loan="loan" />
      </div>
    </div>
    <div v-else class="w-full grid grid-cols-3 gap-[30px] pt-[60px]">
      <div
        v-for="loan in loanStore.filteredLoans"
        v-bind:key="loan.loanId"
        class="p-[20px] bg-divider rounded-lg space-y-[20px] hover:bg-core-darkest"
      >
        <LoanGridCard :loan="loan" />
      </div>
    </div>
  </div>
</template>
