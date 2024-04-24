<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoanStore } from '@/stores/loans'
import { type Loan } from '@/types'
import LoansList from '@/components/lending/LoansList.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { onMounted, ref } from 'vue'
import router from '@/router'

const fetchingData = ref<boolean>(true)

const loanStore = useLoanStore()
const loanOfferStore = useLoanOrderStore()

onMounted(async () => {
  await loanStore.getAvailableLoans()
  fetchingData.value = false
})
</script>

<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 justify-between w-full">
        <div class="flex flex-col leading-snug">
          <p class="text-[32px] font-extrabold text-white">
            P2P Loans
            {{ `(${loanStore.loans.length})` }}
          </p>
          <p v-if="!loanOfferStore.order">Choose a loan that suits you, filter for collateral type, duration etc.</p>
          <p v-else>Check out our FAQ to learn more about how P2P loans work</p>
        </div>
        <CustomButton :title="'Create New Loan'" @click="router.push('/lending/create')" />
      </div>
    </div>
    <section v-if="fetchingData" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[30px] text-core-lightest font-extrabold">Getting Loans</p>
      <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    </section>
    <LoansList v-else @update:selected-loan="router.push(`/lending/${$event.loanId}`)" />
  </section>
</template>
