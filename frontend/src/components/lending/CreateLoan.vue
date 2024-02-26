<script setup lang="ts">
import TokenBar from '@/components/TokenBar.vue'
import InterestField from '@/components/lending/InterestField.vue'
import CustomButton from '@/components/CustomButton.vue'
import { useLoanOrderStore } from '@/stores/loanOrder'
import { useAccountStore } from '@/stores/account'
import WalletButton from '@/components/WalletButton.vue'
import DurationSelect from './DurationSelect.vue'
import RatingSelect from './RatingSelect.vue'
import HorizontalDivider from '@/components/HorizontalDivider.vue'
import ApproveWallet from '@/components/ApproveWallet.vue'
import { ref } from 'vue'
import LoanPreview from './LoanPreview.vue'
import ComponentTitle from '@/components/ComponentTitle.vue'
import AgreeToTerms from '@/components/AgreeToTerms.vue'

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
  <div v-if="step === 0" class="w-full rounded-lg bg-menu p-[10px] lg:p-[30px] space-y-[30px]">
    <ComponentTitle
      :title="'Create new Loan Offer'"
      :description="'Some text about creating a new loan offer'"
      @update:go-back="resetOrder()"
    />
    <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
      <TokenBar :class="'w-full'" :is-sender="true" :offer-type="'loan'" />
      <InterestField />
    </div>
    <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
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
          {{ (((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) * 100).toFixed(2) }}
          %
        </p>
      </div>
      <HorizontalDivider />
      <div class="flex flex-row justify-between" v-if="loanOfferStore.order?.duration && loanOfferStore.order.interest">
        <p class="font-semibold text-core-light">Interest % Annualised</p>
        <p class="font-extrabold text-core-lightest">
          {{
            (
              ((((loanOfferStore.order?.interest ?? 0) / (loanOfferStore.order?.loanAmount ?? 0)) * 100) /
                (loanOfferStore.order?.duration ?? 0)) *
              365
            ).toFixed(2)
          }}
          %
        </p>
      </div>
      <HorizontalDivider />
    </div>

    <div
      class="w-full flex flex-col lg:flex-row items-center text-center lg:justify-between space-y-[20px] lg:space-y-0"
    >
      <div class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
        <WalletButton v-if="!account.account" :class="'w-full lg:w-[228px]'" />
        <CustomButton v-else :title="'Continue'" @click="step++" :class="'w-full lg:w-[228px]'" />
        <CustomButton
          :title="'Cancel'"
          :open="true"
          @click="loanOfferStore.resetOrder()"
          :class="'w-full lg:w-[228px]'"
        />
      </div>
      <AgreeToTerms class="w-full" />
    </div>
  </div>
  <div v-else class="w-full flex flex-col lg:flex-row space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
    <ApproveWallet @update:cancel="updateStep($event)" @update:finished="resetOrder()" />
    <LoanPreview />
  </div>
</template>
