<script setup lang="ts">
import CustomButton from '../CustomButton.vue'
import LoanFilters from './LoanFilters.vue'
import LoanHeaders from './LoanHeaders.vue'
import LoanGridCard from './loancard/LoanGridCard.vue'
import LoanListCard from './loancard/LoanListCard.vue'
import { useLoanStore, type Loan } from '@/stores/loans'
import { ref } from 'vue'

defineEmits<{
  (e: 'update:selectedLoan', value: Loan): void
}>()

const loanStore = useLoanStore()

const view = ref('list')

const showFilters = ref(false)

function changeView(newView: string) {
  view.value = newView
}
</script>

<template>
  <div class="lg:hidden flex flex-col space-y-[20px]">
    <button class="flex flex-row items-center justify-between w-full py-[20px]" @click="showFilters = !showFilters">
      <p class="text-[14px] font-bold text-core-lightest">{{ showFilters ? 'Hide filters' : 'Show filters' }}</p>
      <font-awesome-icon :icon="['fal', 'filter']" class="text-[18px] text-accent-3" />
    </button>
    <div v-if="showFilters" class="pb-[30px]">
      <LoanFilters :view="'list'" :change-view="changeView" :class="'z-10'" />
    </div>
    <div
      v-for="loan in loanStore.filteredLoans"
      v-bind:key="loan.loanId"
      class="relative group p-[20px] bg-divider rounded-lg space-y-[20px] hover:bg-core-darkest -z-1"
    >
      <LoanGridCard :loan="loan" />
    </div>
  </div>

  <div class="hidden lg:flex">
    <div class="w-full rounded-lg bg-menu p-[30px] relative z-10">
      <LoanFilters :view="view" :change-view="changeView" :class="'z-10 hidden lg:flex'" />
      <LoanHeaders v-if="view === 'list'" />
      <div v-if="view === 'list'">
        <div class="space-y-4" v-for="loan in loanStore.filteredLoans" v-bind:key="loan.loanId">
          <LoanListCard :loan="loan" @click="$emit('update:selectedLoan', loan)" />
        </div>
      </div>
      <div v-else class="-z-10 relative w-full grid grid-cols-4 gap-[30px] pt-[60px]">
        <div
          v-for="loan in loanStore.filteredLoans"
          v-bind:key="loan.loanId"
          class="relative group p-[20px] bg-divider rounded-lg space-y-[20px] lg:hover:bg-core-darkest"
        >
          <div class="w-full">
            <LoanGridCard :loan="loan" />
            <div :class="'absolute top-[20px] right-[20px] invisible group-hover:visible z-0'">
              <CustomButton :title="'View'" @click="$emit('update:selectedLoan', loan)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
