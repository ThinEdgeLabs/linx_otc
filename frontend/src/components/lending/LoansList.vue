<script setup lang="ts">
import LoanFilters from './LoanFilters.vue'
import LoanHeaders from './LoanHeaders.vue'
import LoanGridCard from './loancard/LoanGridCard.vue'
import LoanListCard from './loancard/LoanListCard.vue'
import { useLoanStore } from '@/stores/loans'
import { ref } from 'vue'
import { getTokens } from '@/config'

const loanStore = useLoanStore()
const tokens = new Map(getTokens().map((token) => [token.contractId, token]))

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
    <div v-if="loanStore.error" class="flex flex-col w-full h-full py-[15%] items-center text-center">
      <font-awesome-icon :icon="['fal', 'face-disappointed']" class="text-[38px] text-accent-3 pb-[30px]" />
      <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">Oops, something went wrong</div>
      <div class="lg:flex text-core-light text-[14px]">
        Please try again later or reach out to us if the issue persists.
      </div>
    </div>
    <div v-else-if="loanStore.loans.length == 0" class="flex flex-col w-full h-full py-[15%] items-center text-center">
      <font-awesome-icon :icon="['fal', 'bell']" class="text-[38px] text-accent-3 pb-[30px]" />
      <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">No loans available.</div>
      <div class="lg:flex text-core-light text-[14px]">Go ahead and create one!</div>
    </div>
    <div
      v-else
      @click="$router.push(`/lending/${loan.contractId}`)"
      v-for="loan in loanStore.loans"
      v-bind:key="loan.contractId"
      class="relative group px-[20px] pt-[20px] pb-[10px] bg-divider rounded-lg space-y-[20px] hover:bg-core-darker lg:hover:bg-core-darkest -z-1"
    >
      <LoanGridCard :loan="loan" :tokens="tokens" />
    </div>
  </div>

  <div class="hidden lg:flex">
    <div class="w-full rounded-lg bg-menu p-[30px] relative z-10">
      <LoanFilters :view="view" :change-view="changeView" :class="'z-10 hidden lg:flex'" />
      <LoanHeaders v-if="view === 'list'" />
      <div v-if="loanStore.error" class="flex flex-col w-full h-full py-[15%] items-center text-center">
        <font-awesome-icon :icon="['fat', 'face-disappointed']" class="text-[38px] text-accent-3 pb-[30px]" />
        <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">Oops, something went wrong</div>
        <div class="lg:flex text-core-light text-[14px]">
          Please try again later or reach out to us if the issue persists.
        </div>
      </div>
      <div
        v-else-if="loanStore.loans.length === 0"
        class="flex flex-col w-full h-full py-[15%] items-center text-center"
      >
        <font-awesome-icon :icon="['fat', 'bell']" class="text-[38px] text-accent-3 pb-[30px]" />
        <div class="text-[22px] font-extrabold text-core-lightest mb-[10px]">No loans available.</div>
        <div class="lg:flex text-core-light text-[14px]">Go ahead and create one!</div>
      </div>
      <div v-else-if="view === 'list'">
        <div class="space-y-4" v-for="loan in loanStore.loans" v-bind:key="loan.contractId">
          <LoanListCard :loan="loan" :tokens="tokens" @click="$router.push(`/lending/${loan.contractId}`)" />
        </div>
      </div>
      <div v-else class="-z-10 relative w-full grid grid-cols-4 gap-[30px] pt-[60px]">
        <div
          @click="$router.push(`/lending/${loan.contractId}`)"
          v-for="loan in loanStore.loans"
          v-bind:key="loan.contractId"
          class="relative group px-[20px] pt-[20px] pb-[10px] bg-divider rounded-lg space-y-[20px] lg:hover:bg-core-darkest"
        >
          <div class="w-full">
            <LoanGridCard :loan="loan" :tokens="tokens" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
