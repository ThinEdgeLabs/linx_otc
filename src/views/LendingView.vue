<script setup lang="ts">
import CustomButton from '@/components/CustomButton.vue'
import { useLoanStore, type Loan } from '@/stores/loans'
import LoansList from '@/components/lending/LoansList.vue'
import CreateLoan from '@/components/lending/CreateLoan.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import AcceptLoanOffer from '@/components/lending/AcceptLoanOffer.vue'
import { ref } from 'vue'

const loanStore = useLoanStore()
const loanOfferStore = useLoanOrderStore()
const selectedLoan = ref<Loan>()

const loans = loanStore.filterLoans()
</script>
<template>
  <section class="pt-[30px] space-y-[30px]">
    <div>
      <div class="flex flex-row justify-between w-full">
        <p class="text-[32px] font-extrabold text-white">
          P2P Loans
          {{ loanOfferStore.order || selectedLoan ? '' : `(${loanStore.filteredLoans.length})` }}
        </p>
        <CustomButton
          v-if="!selectedLoan"
          :title="'Create New Loan'"
          :class="loanOfferStore.order ? 'invisible' : 'visible'"
          @click="loanOfferStore.startNewLoanOrder()"
        />
      </div>
      <p v-if="!loanOfferStore.order">
        Choose a loan that suits you, filter for collateral type, duration etc.
      </p>
      <p v-else>Check out our FAQ to learn more about how P2P loans work</p>
    </div>
    <LoansList
      v-if="!loanOfferStore.order && !selectedLoan"
      @update:selected-loan="selectedLoan = $event"
    />
    <AcceptLoanOffer
      v-if="selectedLoan"
      :loan="selectedLoan"
      @update:close-offer="selectedLoan = undefined"
    />
    <CreateLoan v-if="loanOfferStore.order" />
  </section>
</template>
