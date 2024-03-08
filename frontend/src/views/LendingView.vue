<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoanStore } from '@/stores/loans'
import { type Loan } from '@/types'
import LoansList from '@/components/lending/LoansList.vue'
import CreateLoan from '@/components/lending/CreateLoan.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import ManageLoanOffer from '@/components/lending/ManageLoanOffer.vue'
import { ref } from 'vue'

const loanStore = useLoanStore()
const loanOfferStore = useLoanOrderStore()
const selectedLoan = ref<Loan>()
</script>

<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 justify-between w-full">
        <div class="flex flex-col leading-snug">
          <p class="text-[32px] font-extrabold text-white">
            P2P Loans
            {{ loanOfferStore.order || selectedLoan ? '' : `(${loanStore.loans.length})` }}
          </p>
          <p v-if="!loanOfferStore.order">Choose a loan that suits you, filter for collateral type, duration etc.</p>
          <p v-else>Check out our FAQ to learn more about how P2P loans work</p>
        </div>
        <CustomButton
          v-if="!selectedLoan"
          :title="'Create New Loan'"
          :class="loanOfferStore.order ? 'invisible' : 'visible h-[52px]'"
          @click="loanOfferStore.startNewLoanOrder()"
        />
      </div>
    </div>
    <LoansList v-if="!loanOfferStore.order && !selectedLoan" @update:selected-loan="selectedLoan = $event" />
    <ManageLoanOffer v-if="selectedLoan" :loan="selectedLoan" @update:close-offer="selectedLoan = undefined" />
    <CreateLoan v-if="loanOfferStore.order" />
  </section>
</template>
