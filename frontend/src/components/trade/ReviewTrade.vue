<script setup lang="ts">
import { tradeFee } from '@/config'
import ReviewAddress from '../ReviewAddress.vue'
import ReviewTokenBar from '../ReviewTokenBar.vue'
import SectionTitle from '../SectionTitle.vue'
import LoanPreviewLabel from '../lending/LoanPreviewLabel.vue'
import HorizontalDivider from '../HorizontalDivider.vue'
import CustomButton from '../CustomButton.vue'
import AgreeToTerms from '../AgreeToTerms.vue'
import { useAccountStore } from '@/stores'
import { shortenString } from '@/functions/stringUtils'
import { useLoginStore } from '@/stores/login'

defineEmits<{
  (e: 'update:approve'): void
  (f: 'update:cancel'): void
}>()

const account = useAccountStore()
const login = useLoginStore()

const props = defineProps({
  tradeOffer: { type: Object, required: true }
})

function calculateResult() {
  return props.tradeOffer.amountFrom * (1 - tradeFee)
}

async function changeWallet() {
  await account.disconnect()
  if (!login.showModal) {
    login.toggleModal()
  }
}
</script>

<template>
  <section class="w-full flex flex-col lg:p-[30px] px-[10px] py-[20px] space-y-[30px] bg-menu rounded-lg">
    <SectionTitle :title="'Order information'" :description="'This is a summary of the order that was send to you'" />
    <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
      <ReviewAddress :is-sender="true" :address="props.tradeOffer.to" />
      <ReviewAddress :is-sender="false" :address="props.tradeOffer.from" />
    </div>
    <div class="w-full flex flex-col lg:flex-row items-center space-y-[20px] lg:space-y-0 lg:space-x-[30px]">
      <ReviewTokenBar :is-sender="true" :amount="props.tradeOffer.amountTo" :token="props.tradeOffer.tokenTo" />
      <ReviewTokenBar :is-sender="false" :amount="props.tradeOffer.amountFrom" :token="props.tradeOffer.tokenFrom" />
    </div>
    <div class="flex flex-col space-y-[15px]">
      <HorizontalDivider />
      <LoanPreviewLabel :title="'P2P Fee'" :amount="(tradeFee * 100).toFixed(2)" :amount_description="'%'" />
      <HorizontalDivider />
      <LoanPreviewLabel
        :title="'You receive'"
        :amount="calculateResult().toString()"
        :amount_description="props.tradeOffer.tokenFrom.symbol"
      />
      <HorizontalDivider />
      <LoanPreviewLabel :title="'Estimated time to create swap'" :amount="'16'" :amount_description="'seconds'" />
      <HorizontalDivider />
    </div>
    <div class="lg:flex flex-row items-center justify-between">
      <div
        class="lg:flex flex-row lg:space-x-[20px] space-y-[20px] lg:space-y-0"
        v-if="account.account?.address === props.tradeOffer.to"
      >
        <CustomButton :title="'Confirm order'" @click="$emit('update:approve')" />
        <CustomButton :title="'Decline'" :open="true" :delete="true" @click="$emit('update:cancel')" />
      </div>
      <div class="flex flex-col space-y-[20px]" v-else>
        <CustomButton :title="'Connect Wallet'" @click="changeWallet()" />
      </div>
      <AgreeToTerms :class="'mt-[20px] lg:mt-0 text-center'" />
    </div>
    <p v-if="account.account?.address !== props.tradeOffer.to" class="text-core-light font-semibold">
      Please connect the wallet with this address:
      <span class="text-core-lightest">{{ shortenString(props.tradeOffer.to, 24) }}</span>
    </p>
  </section>
</template>
