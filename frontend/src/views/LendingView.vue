<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoanStore } from '@/stores/loans'
import LoansList from '@/components/lending/LoansList.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { onMounted } from 'vue'
import router from '@/router'

const loanStore = useLoanStore()
const loanOfferStore = useLoanOrderStore()

onMounted(async () => {
  loanStore.getAvailableLoans()
})
</script>

<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-col lg:flex-row items-center justify-between w-full">
        <div>
          <p class="text-[34px] font-extrabold text-white">
            P2P Loans
            {{ `(${loanStore.loans.length})` }}
          </p>
          <p v-if="!loanOfferStore.order">
            Choose a loan that suits you, filter for collateral type, duration or borrowed token.
          </p>
          <p v-else class="mt-[10px]">Check out our FAQ to learn more about how P2P loans work</p>
        </div>
        <CustomButton :title="'Create New Loan'" class="mt-[20px] lg:mt-0" @click="router.push('/lending/create')" />
      </div>
    </div>
    <section v-if="loanStore.isLoading" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[30px] text-core-lightest font-extrabold">Loading...</p>
      <font-awesome-icon :icon="['fal', 'spinner-third']" spin class="text-accent-3 text-[60px]" />
    </section>
    <section v-else-if="loanStore.error" class="justify-center items-center text-center space-y-[30px]">
      <p class="text-[18px] text-core-lightest">{{ loanStore.error }}</p>
    </section>
    <LoansList v-else @update:selected-loan="router.push(`/lending/${$event.loanId}`)" />
  </section>
</template>
