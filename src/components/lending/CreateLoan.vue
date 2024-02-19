<script setup lang="ts">
import SectionTitle from '@/components/SectionTitle.vue'
import TokenBar from '@/components/TokenBar.vue'
import InterestField from '@/components/lending/InterestField.vue'
import CustomButton from '../CustomButton.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { useAccountStore } from '@/stores/account'
import WalletButton from '../WalletButton.vue'
import DurationSelect from './DurationSelect.vue'
import RatingSelect from './RatingSelect.vue'
import HorizontalDivider from '../HorizontalDivider.vue'
import ApproveWallet from '../ApproveWallet.vue'
import { ref } from 'vue'
import LoanPreview from './LoanPreview.vue'

const loanOfferStore = useLoanOrderStore()
const account = useAccountStore()
const step = ref(0)

function updateStep(stepChange: number) {
  step.value = stepChange
}

function resetOrder() {
  loanOfferStore.resetOrder()
}
</script>
<template>
  <div v-if="step === 0" class="w-full rounded-lg bg-menu p-[30px] space-y-[30px]">
    <SectionTitle
      :title="'Create new Loan Offer'"
      :description="'Some text about creating a new loan offer'"
    />
    <div class="w-full flex flex-row items-center space-x-[30px]">
      <TokenBar :class="'w-full'" :is-sender="true" :offer-type="'loan'" />
      <InterestField />
    </div>
    <div class="w-full flex flex-row items-center space-x-[30px]">
      <TokenBar :class="'w-full'" :is-sender="false" :offer-type="'loan'" />
      <div class="w-full flex flex-row space-x-[30px]">
        <DurationSelect />
        <RatingSelect />
      </div>
    </div>

    <div
      class="flex flex-col space-y-[10px] text-[14px]"
      v-if="loanOfferStore.order?.duration && loanOfferStore.order.interest"
    >
      <HorizontalDivider />
      <div class="flex flex-row justify-between">
        <p class="font-semibold text-core-light">Interest % over Loan</p>
        <p class="font-extrabold text-core-lightest">
          {{
            (
              ((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) *
              100
            ).toFixed(2)
          }}
          %
        </p>
      </div>
      <HorizontalDivider />
      <div
        class="flex flex-row justify-between"
        v-if="loanOfferStore.order?.duration && loanOfferStore.order.interest"
      >
        <p class="font-semibold text-core-light">Interest % Annualised</p>
        <p class="font-extrabold text-core-lightest">
          {{
            (
              ((((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) *
                100) /
                (loanOfferStore.order?.duration ?? 0)) *
              365
            ).toFixed(2)
          }}
          %
        </p>
      </div>
      <HorizontalDivider />
    </div>

    <div class="flex flex-row space-x-[30px]">
      <WalletButton v-if="!account.account" />
      <CustomButton v-else :title="'Continue'" @click="step++" />
      <CustomButton :title="'Cancel'" :open="true" @click="loanOfferStore.resetOrder()" />
    </div>
  </div>
  <div v-else class="w-full flex flex-row space-x-[30px]">
    <ApproveWallet @update:cancel="updateStep($event)" @update:finished="resetOrder()" />
    <LoanPreview />
  </div>
</template>
