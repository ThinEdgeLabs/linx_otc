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

const loanOfferStore = useLoanOrderStore()
const account = useAccountStore()
</script>
<template>
  <div class="w-full rounded-lg bg-menu p-[30px] space-y-[30px]">
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
    <div class="flex flex-row space-x-[30px]">
      <WalletButton v-if="!account.account" />
      <CustomButton v-else :title="'Continue'" @click="console.log(loanOfferStore.order)" />
      <CustomButton :title="'Cancel'" :open="true" @click="loanOfferStore.resetOrder()" />
    </div>
  </div>
</template>
