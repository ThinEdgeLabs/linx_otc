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
  <section class="w-full flex flex-col p-[30px] space-y-[30px] bg-menu rounded-lg">
    <SectionTitle :title="'Order information'" :description="'This is a summary of the order that was send to you'" />
    <div class="flex flex-row items-center w-full space-x-[30px]">
      <ReviewAddress :is-sender="true" :address="props.tradeOffer.to" />
      <ReviewAddress :is-sender="false" :address="props.tradeOffer.from" />
    </div>
    <div class="flex flex-row items-center w-full space-x-[30px]">
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
    <div class="flex flex-row items-center justify-between">
      <div class="flex flex-row space-x-[20px]" v-if="account.account?.address === props.tradeOffer.to">
        <CustomButton :title="'Confirm order'" />
        <CustomButton :title="'Decline'" :open="true" :delete="true" />
      </div>
      <div class="flex flex-col space-y-[20px]" v-else>
        <CustomButton :title="'Connect Wallet'" :class="'w-[228px]'" @click="changeWallet()" />
        <p class="text-core-light font-semibold">
          Please connect the wallet for the address: {{ shortenString(props.tradeOffer.to, 24) }}
        </p>
      </div>
      <AgreeToTerms />
    </div>
  </section>
</template>
